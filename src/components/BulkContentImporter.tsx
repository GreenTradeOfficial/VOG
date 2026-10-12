import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Save,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Plus,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { DailyLift, DailyDevotion, ContentStatus } from '../types';
import { saveDailyLiftToCloud, saveDailyDevotionToCloud } from '../services/churchContentService';

export interface ParsedImportItem {
  id: string;
  targetType: 'lift' | 'devotion';
  date: string; // YYYY-MM-DD
  title: string;
  scriptureRef: string;
  bibleVerseText: string;
  content: string; // Message or Devotional Teaching
  prayerPoints: string;
  faithDeclaration: string;
  status: ContentStatus;
  category?: 'Encouragement' | 'Faith' | 'Grace' | 'Overcoming' | 'Prayer' | 'Wisdom';
  isDuplicate?: boolean;
  isValid: boolean;
  validationError?: string;
}

const SAMPLE_DEVOTION_TEMPLATE = `DATE: 2026-10-15
TITLE: Walking in Supernatural Access
SCRIPTURE: 1 Corinthians 2:9-10
VERSE: Eye has not seen, nor ear heard, neither have entered into the heart of man, the things which God hath prepared for them that love him.
MESSAGE: Beloved of God, you are stepping into a season where human limitations no longer define your boundaries. By the Spirit of grace, divine access is granted into deep mysteries and supernatural supplies.
PRAYER: Heavenly Father, I thank You for granting me divine access into every good thing You have prepared for my life and destiny.
DECLARATION: I declare that the grace of God opens ancient doors of favor, victory, and access for me in Jesus' name!
---
DATE: 2026-10-16
TITLE: The Unfailing Grace of God
SCRIPTURE: Ephesians 2:8-9
VERSE: For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.
MESSAGE: Grace is not merely an unmerited favor; it is the divine influence of God upon the human heart and its reflection in our everyday living. Stand secure in the finished work of Christ.
PRAYER: Lord, teach me to rest completely in Your unfailing grace and walk in righteousness all my days.
DECLARATION: By the unsearchable grace of Christ, I prevail in every storm and walk in divine victory!`;

export const BulkContentImporter: React.FC = () => {
  const { dailyLifts, dailyDevotions, addDailyLift, showToast } = useChurch();

  const [targetType, setTargetType] = useState<'lift' | 'devotion'>('lift');
  const [inputText, setInputText] = useState('');
  const [importStatus, setImportStatus] = useState<ContentStatus>('draft');
  const [parsedItems, setParsedItems] = useState<ParsedImportItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [editingItem, setEditingItem] = useState<ParsedImportItem | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Helper to normalize dates into YYYY-MM-DD
  const parseDateString = (raw: string): string => {
    const cleaned = raw.trim();
    if (!cleaned) return new Date().toISOString().split('T')[0];

    // Standard ISO format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      return cleaned;
    }

    // DD/MM/YYYY or MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
      const parts = cleaned.split('/');
      const year = parts[2];
      const month = parts[1].padStart(2, '0');
      const day = parts[0].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Try parsing Date
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
  };

  // Parser logic
  const handleParseContent = () => {
    if (!inputText.trim()) {
      showToast('Please paste your prepared messages or CSV data first.', 'info');
      return;
    }

    const items: ParsedImportItem[] = [];
    const text = inputText.trim();

    // 1. Try CSV Parsing if text looks like CSV with commas or quotes
    const isCsv = text.includes(',') && text.split('\n')[0].toLowerCase().includes('title');

    if (isCsv) {
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''));

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Split by comma outside quotes
        const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        const cols = match ? match.map((c) => c.replace(/^"|"$/g, '').trim()) : line.split(',');

        const getCol = (key: string) => {
          const idx = headers.findIndex((h) => h.includes(key));
          return idx >= 0 && cols[idx] ? cols[idx] : '';
        };

        const date = parseDateString(getCol('date'));
        const title = getCol('title') || `Message #${i}`;
        const scriptureRef = getCol('scripture') || getCol('ref') || 'Scripture Reference';
        const bibleVerseText = getCol('verse') || '';
        const content = getCol('message') || getCol('teaching') || getCol('content') || '';
        const prayerPoints = getCol('prayer') || '';
        const faithDeclaration = getCol('declaration') || '';

        const existingLift = dailyLifts.find((l) => l.date === date);
        const existingDev = dailyDevotions.find((d) => d.date === date);
        const isDuplicate = targetType === 'lift' ? Boolean(existingLift) : Boolean(existingDev);

        items.push({
          id: 'parsed-' + Date.now() + '-' + i,
          targetType,
          date,
          title,
          scriptureRef,
          bibleVerseText,
          content,
          prayerPoints,
          faithDeclaration,
          status: importStatus,
          category: 'Grace',
          isDuplicate,
          isValid: Boolean(title && content),
          validationError: !title ? 'Missing Title' : !content ? 'Missing Devotional Text' : undefined,
        });
      }
    } else {
      // 2. Multi-section text parser (separated by --- or === or [ENTRY])
      const blocks = text.split(/(?:---+|===+|\[ENTRY\]|\n\s*\n\s*DATE:)/i).filter((b) => b.trim().length > 0);

      blocks.forEach((block, idx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

        let date = '';
        let title = '';
        let scriptureRef = '';
        let bibleVerseText = '';
        let content = '';
        let prayerPoints = '';
        let faithDeclaration = '';

        let currentSection = 'content';

        lines.forEach((line) => {
          const lower = line.toLowerCase();
          if (lower.startsWith('date:') || lower.startsWith('date -')) {
            date = parseDateString(line.replace(/date[:\-]/i, '').trim());
          } else if (lower.startsWith('title:') || lower.startsWith('theme:')) {
            title = line.replace(/(?:title|theme)[:\-]/i, '').trim();
          } else if (lower.startsWith('scripture:') || lower.startsWith('scripture ref:') || lower.startsWith('bible ref:')) {
            scriptureRef = line.replace(/(?:scripture(?:\s*ref)?|bible\s*ref)[:\-]/i, '').trim();
          } else if (lower.startsWith('verse:') || lower.startsWith('bible verse:')) {
            bibleVerseText = line.replace(/(?:bible\s*)?verse[:\-]/i, '').trim();
          } else if (lower.startsWith('message:') || lower.startsWith('devotional:') || lower.startsWith('teaching:')) {
            currentSection = 'message';
            content = line.replace(/(?:message|devotional|teaching)[:\-]/i, '').trim();
          } else if (lower.startsWith('prayer:') || lower.startsWith('prayer points:')) {
            currentSection = 'prayer';
            prayerPoints = line.replace(/prayer(?:\s*points)?[:\-]/i, '').trim();
          } else if (lower.startsWith('declaration:') || lower.startsWith('faith declaration:')) {
            currentSection = 'declaration';
            faithDeclaration = line.replace(/(?:faith\s*)?declaration[:\-]/i, '').trim();
          } else {
            // Append continuation lines to current section
            if (currentSection === 'message') {
              content = content ? `${content}\n${line}` : line;
            } else if (currentSection === 'prayer') {
              prayerPoints = prayerPoints ? `${prayerPoints}\n${line}` : line;
            } else if (currentSection === 'declaration') {
              faithDeclaration = faithDeclaration ? `${faithDeclaration}\n${line}` : line;
            } else if (!title) {
              title = line;
            } else {
              content = content ? `${content}\n${line}` : line;
            }
          }
        });

        if (!date) {
          const fallbackDate = new Date();
          fallbackDate.setDate(fallbackDate.getDate() + idx);
          date = fallbackDate.toISOString().split('T')[0];
        }

        const existingLift = dailyLifts.find((l) => l.date === date);
        const existingDev = dailyDevotions.find((d) => d.date === date);
        const isDuplicate = targetType === 'lift' ? Boolean(existingLift) : Boolean(existingDev);

        items.push({
          id: 'parsed-' + Date.now() + '-' + idx,
          targetType,
          date,
          title: title || `Devotional Day ${idx + 1}`,
          scriptureRef: scriptureRef || 'Scripture of Grace',
          bibleVerseText: bibleVerseText || '',
          content: content || 'Grace and truth came through Jesus Christ.',
          prayerPoints: prayerPoints || '',
          faithDeclaration: faithDeclaration || '',
          status: importStatus,
          category: 'Grace',
          isDuplicate,
          isValid: Boolean(title || content),
          validationError: !content ? 'Devotional message body is empty' : undefined,
        });
      });
    }

    setParsedItems(items);
    // Select all valid items by default
    const validIds = new Set(items.filter((i) => i.isValid).map((i) => i.id));
    setSelectedIds(validIds);

    showToast(`Parsed ${items.length} messages. Inspect and review each below before saving!`, 'success');
  };

  // Handle saving all selected items to Cloud Firestore
  const handleBulkSaveToCloud = async () => {
    const toSave = parsedItems.filter((item) => selectedIds.has(item.id));
    if (toSave.length === 0) {
      showToast('Please select at least one entry to save.', 'info');
      return;
    }

    setIsProcessing(true);
    setUploadProgress({ current: 0, total: toSave.length });

    let savedCount = 0;
    try {
      for (let i = 0; i < toSave.length; i++) {
        const item = toSave[i];

        if (targetType === 'lift') {
          const liftPayload: DailyLift = {
            id: 'lift-' + item.date.replace(/-/g, '') + '-' + Date.now() + '-' + i,
            title: item.title,
            date: item.date,
            scriptureRef: item.scriptureRef,
            bibleVerseText: item.bibleVerseText,
            content: item.content,
            prayerPoints: item.prayerPoints,
            faithDeclaration: item.faithDeclaration,
            author: 'Pastor West Somina',
            category: item.category || 'Grace',
            status: item.status,
            sharesCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await saveDailyLiftToCloud(liftPayload);
        } else {
          const devPayload: DailyDevotion = {
            id: 'devotion-' + item.date.replace(/-/g, '') + '-' + Date.now() + '-' + i,
            date: item.date,
            theme: item.title,
            bibleRef: item.scriptureRef,
            bibleVerse: item.bibleVerseText,
            devotionalTeaching: item.content,
            prayerOfDay: item.prayerPoints,
            faithDeclaration: item.faithDeclaration,
            author: 'Pastor West Somina',
            status: item.status,
          };
          await saveDailyDevotionToCloud(devPayload);
        }

        savedCount++;
        setUploadProgress({ current: savedCount, total: toSave.length });
      }

      showToast(
        `Successfully saved ${savedCount} ${targetType === 'lift' ? 'Daily Lifts' : 'Devotionals'} to Cloud Database!`,
        'success'
      );

      // Clear imported items after success
      setParsedItems([]);
      setInputText('');
    } catch (err: any) {
      console.error('Bulk save error:', err);
      showToast(`Error saving batch: ${err.message || 'Check connection'}`, 'info');
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
    }
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_DEVOTION_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
    showToast('Copied template format to clipboard!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                BULK IMPORT & REVIEW ENGINE
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pastor's Original Words Protected</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-blue-950 font-serif-church">
              Bulk Content Importer & Inspector
            </h3>
            <p className="text-xs text-slate-500 max-w-xl">
              Import weeks or an entire year of Daily Lifts and Devotions prepared by Senior Pastor West Somina.
              Inspect every parsed entry and review or correct before publishing to the church app.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyTemplate}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTemplate ? 'Copied' : 'Copy Sample Format'}</span>
            </button>
          </div>
        </div>

        {/* Configurations Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Content Destination
            </label>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setTargetType('lift')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                  targetType === 'lift' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily Lifts</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetType('devotion')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                  targetType === 'devotion' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Daily Devotionals</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Default Publication Status
            </label>
            <select
              value={importStatus}
              onChange={(e) => setImportStatus(e.target.value as ContentStatus)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-900"
            >
              <option value="draft">Save as Drafts (Review First)</option>
              <option value="scheduled">Schedule for Designated Date</option>
              <option value="published">Publish Immediately to App</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleParseContent}
              disabled={isProcessing || !inputText.trim()}
              className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 min-h-[42px]"
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>Parse & Inspect Content</span>
            </button>
          </div>
        </div>

        {/* Input Textarea for Pastor's Content */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              Paste Pastor's Manuscripts, DOCX Text, or CSV Data
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Supports DATE:, TITLE:, SCRIPTURE:, VERSE:, MESSAGE:, PRAYER:, DECLARATION:
            </span>
          </div>
          <textarea
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste raw messages here...\n\nExample:\nDATE: 2026-10-15\nTITLE: Walking in Grace\nSCRIPTURE: 1 Corinthians 2:9\nVERSE: Eye has not seen, nor ear heard...\nMESSAGE: Beloved, you are stepping into a season...\nPRAYER: Father, I thank You for granting me divine access...\nDECLARATION: I declare that the grace of God opens ancient doors!\n---`}
            className="w-full text-xs font-mono p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-900 leading-relaxed bg-slate-50/50"
          />
        </div>
      </div>

      {/* INSPECTOR & REVIEW TABLE SECTION */}
      {parsedItems.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-blue-950 font-serif-church">
                  Inspector & Content Review Table ({parsedItems.length} Entries)
                </h4>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                  {selectedIds.size} Selected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Carefully review and verify the pastor's words. You can edit any title, scripture, or message before bulk saving.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.size === parsedItems.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(parsedItems.map((i) => i.id)));
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                {selectedIds.size === parsedItems.length ? 'Deselect All' : 'Select All'}
              </button>

              <button
                type="button"
                onClick={handleBulkSaveToCloud}
                disabled={isProcessing || selectedIds.size === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? `Saving (${uploadProgress?.current || 0}/${uploadProgress?.total || 0})...`
                    : `Bulk Save ${selectedIds.size} Entries to Cloud`}
                </span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {uploadProgress && (
            <div className="space-y-1.5 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex justify-between text-xs font-bold text-blue-950">
                <span>Saving verified devotionals to Cloud Database...</span>
                <span>
                  {uploadProgress.current} / {uploadProgress.total}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-200"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Parsed Cards List */}
          <div className="space-y-4">
            {parsedItems.map((item, idx) => {
              const isSelected = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-white border-blue-300 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(item.id);
                          else next.delete(item.id);
                          setSelectedIds(next);
                        }}
                        className="mt-1 w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-900 cursor-pointer"
                      />

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            #{idx + 1} · {item.date}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-50 text-blue-900 border border-blue-200">
                            {targetType === 'lift' ? 'Daily Lift' : 'Devotional'}
                          </span>

                          {item.isDuplicate && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-300">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Date Already in Database</span>
                            </span>
                          )}

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {item.status}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 font-serif-church">
                          {item.title}
                        </h4>

                        <p className="text-xs font-semibold text-blue-900">
                          📖 {item.scriptureRef} {item.bibleVerseText ? `— "${item.bibleVerseText}"` : ''}
                        </p>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {item.content}
                        </p>

                        {(item.prayerPoints || item.faithDeclaration) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                            {item.prayerPoints && (
                              <p className="text-slate-600 italic">
                                <span className="font-bold text-slate-800 not-italic">Prayer: </span>
                                {item.prayerPoints}
                              </p>
                            )}
                            {item.faithDeclaration && (
                              <p className="text-blue-950 font-medium">
                                <span className="font-bold text-blue-900">Declaration: </span>
                                {item.faithDeclaration}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="p-2 text-blue-900 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200"
                        title="Edit and correct this entry"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setParsedItems((prev) => prev.filter((p) => p.id !== item.id));
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            next.delete(item.id);
                            return next;
                          });
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                        title="Remove from batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INLINE EDIT MODAL FOR REVIEWING / CORRECTING PASTOR'S MESSAGE */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-blue-950 font-serif-church">
                Review & Correct Parsed Message
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingItem.date}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, date: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        status: e.target.value as ContentStatus,
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title / Theme</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scripture Reference</label>
                  <input
                    type="text"
                    value={editingItem.scriptureRef}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, scriptureRef: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bible Verse Text</label>
                  <input
                    type="text"
                    value={editingItem.bibleVerseText}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, bibleVerseText: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Devotional / Message Teaching Text
                </label>
                <textarea
                  rows={5}
                  value={editingItem.content}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, content: e.target.value })
                  }
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prayer Points</label>
                <textarea
                  rows={2}
                  value={editingItem.prayerPoints}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, prayerPoints: e.target.value })
                  }
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faith Declaration</label>
                <input
                  type="text"
                  value={editingItem.faithDeclaration}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, faithDeclaration: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setParsedItems((prev) =>
                    prev.map((p) => (p.id === editingItem.id ? editingItem : p))
                  );
                  setEditingItem(null);
                  showToast('Correction applied to parsed entry.', 'success');
                }}
                className="px-5 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl hover:bg-blue-800"
              >
                Save Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
