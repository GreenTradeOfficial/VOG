import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Database,
  Lock,
  UserCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { ADMIN_EMAILS } from '../services/memberAuthService';

export const AdminAccessGuide: React.FC = () => {
  const { currentUser, userProfile, showToast } = useChurch();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    showToast(`Copied ${keyName} to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const sampleUidSnippet = currentUser?.uid || 'FIREBASE_AUTH_UID';
  const sampleFirestoreDoc = `// Firestore Path: /admins/${sampleUidSnippet}
{
  "email": "${currentUser?.email || 'admin@vogcenter.org'}",
  "displayName": "${currentUser?.displayName || 'Church Administrator'}",
  "role": "admin",
  "authorizedBy": "Senior Pastor West Somina",
  "createdAt": "${new Date().toISOString()}"
}`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-blue-950 font-serif-church">
          Church Administrative Access & Security Architecture
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Server-side Role-Based Access Control (RBAC) enforced via Firestore Security Rules.
        </p>
      </div>

      {/* Active Session Verification Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-emerald-800">
          <ShieldCheck className="w-5 h-5" />
          <h4 className="text-sm font-extrabold">Active Administrator Session Verified</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">
              Authenticated Admin Email
            </span>
            <span className="font-bold text-slate-900 font-mono">
              {currentUser?.email || 'Not detected'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">
              Firebase Auth Unique ID (UID)
            </span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 font-mono truncate max-w-[180px]">
                {currentUser?.uid || 'Not detected'}
              </span>
              {currentUser?.uid && (
                <button
                  onClick={() => copyToClipboard(currentUser.uid, 'Firebase UID')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500"
                  title="Copy UID"
                >
                  {copiedKey === 'Firebase UID' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Server-side rules grant write authority because your account is verified in the church administrative roster.
          </span>
        </div>
      </div>

      {/* How to Securely Authorize Any Account Guide */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-blue-950">
          <KeyRound className="w-5 h-5 text-blue-900" />
          <h4 className="text-sm font-extrabold">
            How to Authorize New Administrators Securely (Without Exposing Secrets)
          </h4>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            In production, <strong>new account registrations are regular members by default</strong>. An ordinary visitor or member on another phone cannot see or execute administrative changes.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-extrabold text-blue-950 block">
              Step-by-Step Authorization Instructions:
            </span>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-600">
              <li>
                Ask the new church leader or staff member to sign up in the app using their email or Google account.
              </li>
              <li>
                Copy their <strong>Firebase Auth UID</strong> from the Firebase Authentication console.
              </li>
              <li>
                Open the Firebase Console &rarr; <strong>Firestore Database</strong>.
              </li>
              <li>
                Navigate to the collection named <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-blue-950">admins</code>.
              </li>
              <li>
                Create a new document where the <strong>Document ID is their UID</strong>:
              </li>
            </ol>
          </div>

          <div className="relative">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto">
              <pre>{sampleFirestoreDoc}</pre>
            </div>
            <button
              onClick={() => copyToClipboard(sampleFirestoreDoc, 'Firestore Document JSON')}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
            >
              {copiedKey === 'Firestore Document JSON' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Copy JSON</span>
            </button>
          </div>

          <p className="text-slate-500 italic">
            Once this document is saved in Firestore, the rule <code className="bg-slate-100 px-1 rounded text-slate-800">exists(/databases/$(database)/documents/admins/$(request.auth.uid))</code> immediately activates on the Google Cloud backend, granting that account full privileges without redeploying code or storing passwords in the repository.
          </p>
        </div>
      </div>
    </div>
  );
};
