import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Heart } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';

interface ShareButtonsProps {
  title: string;
  text: string;
  reference?: string;
  itemId?: string;
  itemType?: 'lift' | 'devotion' | 'sermon';
  itemDate?: string;
  showFavorite?: boolean;
  className?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  title,
  text,
  reference,
  itemId,
  itemType = 'lift',
  itemDate = new Date().toISOString().split('T')[0],
  showFavorite = true,
  className = '',
}) => {
  const { toggleFavorite, isFavorite, showToast } = useChurch();
  const [copied, setCopied] = useState(false);

  const fullShareText = `🕊️ *VESSEL OF GRACE CHRISTIAN CENTER (VOG)*\n*${title}*\n${reference ? `📖 _${reference}_\n\n` : ''}${text}\n\n✝️ _Vessel of Grace Mobile Church Community_`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      showToast('Spiritual message copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Message copied!');
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(fullShareText);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `VOG: ${title}`,
          text: fullShareText,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleWhatsAppShare();
    }
  };

  const isFav = itemId ? isFavorite(itemId) : false;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showFavorite && itemId && (
        <button
          onClick={() => toggleFavorite(itemId, itemType, title, itemDate)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors min-h-[44px] min-w-[44px] ${
            isFav
              ? 'bg-rose-50 text-rose-600 border-rose-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title={isFav ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600 text-rose-600' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">{isFav ? 'Saved' : 'Favorite'}</span>
        </button>
      )}

      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
        title="Copy message text"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>

      <button
        onClick={handleWhatsAppShare}
        className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-700/20 min-h-[44px]"
        title="Share to WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        <span>WhatsApp</span>
      </button>

      <button
        onClick={handleNativeShare}
        className="flex items-center justify-center p-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px] min-w-[44px]"
        title="More share options"
        aria-label="Share"
      >
        <Share2 className="w-4 h-4 text-slate-600" />
      </button>
    </div>
  );
};
