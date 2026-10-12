import React, { useState } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  Trash2,
  Phone,
  Mail,
  User,
  Calendar,
  Sparkles,
  Filter,
  Search,
  Lock,
  Mic,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { PrayerRequest } from '../types';

export const AdminPrayersManager: React.FC = () => {
  const { prayerRequests, updatePrayerRequestStatus, deletePrayerRequest, showToast } =
    useChurch();

  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'praying' | 'answered'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusChange = (id: string, newStatus: PrayerRequest['status']) => {
    updatePrayerRequestStatus(id, newStatus);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete prayer request from "${name}"?`)) {
      deletePrayerRequest(id);
    }
  };

  const filtered = prayerRequests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && req.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = req.name.toLowerCase().includes(q);
      const matchText = req.requestText.toLowerCase().includes(q);
      const matchCat = req.category.toLowerCase().includes(q);
      if (!matchName && !matchText && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-blue-950 font-serif-church">
              Pastoral Intercession & Prayer Requests ({prayerRequests.length})
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-300/60">
              <Lock className="w-2.5 h-2.5" /> Confidential
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Confidential requests received from congregation brethren for Pastor West Somina & intercessory team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="all">All Requests</option>
            <option value="received">Received (Unprocessed)</option>
            <option value="praying">In Prayer Intercession</option>
            <option value="answered">Answered Prayers</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by petitioner name or prayer topic..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 shadow-2xs"
        />
      </div>

      {/* Prayer Requests List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">
              No prayer requests found matching your filter criteria.
            </div>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-950">
                      {req.category}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        req.status === 'answered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'praying'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {req.status === 'answered'
                        ? 'Answered by God'
                        : req.status === 'praying'
                        ? 'In Intercession'
                        : 'Received'}
                    </span>

                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {req.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <User className="w-3.5 h-3.5 text-blue-900" />
                    <span>{req.name}</span>
                    {req.phone && (
                      <span className="text-slate-500 font-medium flex items-center gap-1 ml-2">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <a href={`tel:${req.phone}`} className="hover:underline">
                          {req.phone}
                        </a>
                      </span>
                    )}
                    {req.email && (
                      <span className="text-slate-500 font-medium flex items-center gap-1 ml-2">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <a href={`mailto:${req.email}`} className="hover:underline">
                          {req.email}
                        </a>
                      </span>
                    )}
                  </div>

                  {/* Voice Note Audio Recording Player */}
                  {(req.hasVoiceNote || req.voiceNoteUrl) && (
                    <div className="p-3 bg-blue-50/90 rounded-2xl border border-blue-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                        <span className="flex items-center gap-1.5 text-blue-900">
                          <Mic className="w-4 h-4 text-amber-600" />
                          <span>Confidential Voice Note from Brethren</span>
                        </span>
                        {req.voiceNoteDurationSec && (
                          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {Math.floor(req.voiceNoteDurationSec / 60)}:
                            {(req.voiceNoteDurationSec % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <audio
                        controls
                        src={req.voiceNoteUrl}
                        className="w-full h-8"
                        preload="metadata"
                      />
                    </div>
                  )}

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-sans">
                    "{req.requestText}"
                  </p>
                </div>

                {/* Status Toggle & Delete Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  {req.status !== 'praying' && req.status !== 'answered' && (
                    <button
                      onClick={() => handleStatusChange(req.id, 'praying')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-2xs"
                      title="Mark as actively being prayed for"
                    >
                      Stand in Prayer
                    </button>
                  )}

                  {req.status !== 'answered' && (
                    <button
                      onClick={() => handleStatusChange(req.id, 'answered')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1"
                      title="Mark as answered prayer / praise report"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Answered</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(req.id, req.name)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                    title="Delete prayer request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
