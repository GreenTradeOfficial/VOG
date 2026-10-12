import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';

interface VogLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  className?: string;
  allowReplaceModal?: boolean;
}

export const VogLogo: React.FC<VogLogoProps> = ({
  size = 'md',
  showText = false,
  textClassName = '',
  className = '',
  allowReplaceModal = false,
}) => {
  const { customLogoUrl, setCustomLogoUrl, showToast } = useChurch();
  const [showModal, setShowModal] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  const sizeDimensions = {
    xs: { px: 28, text: 'text-xs' },
    sm: { px: 36, text: 'text-sm' },
    md: { px: 46, text: 'text-base' },
    lg: { px: 64, text: 'text-lg' },
    xl: { px: 96, text: 'text-2xl' },
  }[size];

  const handleSaveLogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setCustomLogoUrl(inputUrl.trim());
      showToast('Official logo updated successfully!', 'success');
      setShowModal(false);
      setInputUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomLogoUrl(reader.result);
          showToast('Official logo image loaded!', 'success');
          setShowModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = () => {
    setCustomLogoUrl(null);
    showToast('Reset to official VOG emblem logo', 'info');
    setShowModal(false);
  };

  return (
    <>
      <div
        className={`inline-flex items-center gap-2.5 select-none ${allowReplaceModal ? 'cursor-pointer group' : ''} ${className}`}
        onClick={allowReplaceModal ? () => setShowModal(true) : undefined}
        title={allowReplaceModal ? 'Click to configure church logo' : 'VESSEL OF GRACE CHRISTIAN CENTER (VOG)'}
      >
        {customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt="Vessel of Grace Christian Center Official Logo"
            className="rounded-full object-cover shadow-sm ring-2 ring-amber-400/50"
            style={{ width: sizeDimensions.px, height: sizeDimensions.px }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="relative flex items-center justify-center shrink-0 rounded-full shadow-md overflow-hidden"
            style={{ width: sizeDimensions.px, height: sizeDimensions.px }}
          >
            {/* High-fidelity SVG recreating the official 3D Gold, Red & Blue VOG Emblem */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 3D Circular Disc Gradient: Fiery Red top-right, Royal Purple & Deep Blue bottom-left */}
                <radialGradient id="vogDiscGrad" cx="70%" cy="30%" r="85%">
                  <stop offset="0%" stopColor="#FF1E27" />
                  <stop offset="35%" stopColor="#DC2626" />
                  <stop offset="65%" stopColor="#581C87" />
                  <stop offset="90%" stopColor="#1E1B4B" />
                  <stop offset="100%" stopColor="#0B132B" />
                </radialGradient>

                {/* 3D Metallic Gold Gradient for Vessel Body */}
                <linearGradient id="vogGoldGrad" x1="20%" y1="20%" x2="85%" y2="85%">
                  <stop offset="0%" stopColor="#FEF9C3" />
                  <stop offset="25%" stopColor="#FACC15" />
                  <stop offset="50%" stopColor="#EAB308" />
                  <stop offset="75%" stopColor="#CA8A04" />
                  <stop offset="100%" stopColor="#854D0E" />
                </linearGradient>

                {/* Specular Highlight Gold */}
                <linearGradient id="vogGoldHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#FEF08A" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0.1" />
                </linearGradient>

                {/* Sphere Radial Glow for 3D Bubbles */}
                <radialGradient id="goldSphere" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="25%" stopColor="#FEF08A" />
                  <stop offset="60%" stopColor="#EAB308" />
                  <stop offset="90%" stopColor="#A16207" />
                  <stop offset="100%" stopColor="#713F12" />
                </radialGradient>

                {/* Bevel Shadow Filter */}
                <filter id="vogBevelDrop" x="-10%" y="-10%" width="125%" height="125%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.55" />
                </filter>
              </defs>

              {/* Outer Badge Disc */}
              <circle cx="100" cy="100" r="98" fill="url(#vogDiscGrad)" stroke="#EAB308" strokeWidth="1.5" />
              {/* Inner ambient rim */}
              <circle cx="100" cy="100" r="95" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1" />

              {/* Group with 3D shadow for the golden vessel icon */}
              <g filter="url(#vogBevelDrop)">
                {/* 1. Ascending Golden Droplets / Bubbles of Grace at Top-Left */}
                {/* Tiny droplet */}
                <circle cx="77" cy="51" r="3.2" fill="url(#goldSphere)" />
                {/* Small droplet */}
                <circle cx="72" cy="58" r="4.5" fill="url(#goldSphere)" />
                {/* Medium droplet */}
                <circle cx="67" cy="67" r="5.8" fill="url(#goldSphere)" />
                {/* Large primary glowing orb of grace */}
                <circle cx="56" cy="85" r="11" fill="url(#goldSphere)" stroke="#78350F" strokeWidth="0.8" />

                {/* 2. Main Sculptural Golden Vessel & Flowing Streams */}
                {/* Upper pouring lip and crown fluting */}
                <path
                  d="M90 50 C95 44 100 40 106 40 C104 46 102 52 108 51 C114 50 119 44 123 41 C135 43 148 45 158 52 C146 64 135 77 122 89 C126 83 131 77 137 72 C115 88 95 106 78 126 C72 133 67 141 64 149 C60 144 58 138 56 132 C54 116 57 104 68 93 C76 85 85 78 92 68 C88 71 84 76 80 81 C77 84 73 85 69 84 C62 81 57 74 60 67 C63 60 72 56 79 60 C84 63 87 67 90 71 C92 63 91 56 90 50 Z"
                  fill="url(#vogGoldGrad)"
                  stroke="#78350F"
                  strokeWidth="1.2"
                />

                {/* Golden Vessel Wing / Spout Body with Specular Highlight */}
                <path
                  d="M106 40 C125 43 145 47 158 52 C154 75 142 105 130 130 C138 120 145 108 152 95 C146 118 135 140 120 156 C115 145 112 133 111 120 C109 108 111 96 117 84 C111 91 106 100 102 110 C96 125 92 142 90 158 C84 150 79 140 76 130 C86 110 101 92 118 76 C124 70 129 65 134 59 C120 54 112 48 106 40 Z"
                  fill="url(#vogGoldGrad)"
                  stroke="#78350F"
                  strokeWidth="1.2"
                />

                {/* Inner Loop Eye on Left (Handle opening) */}
                <ellipse cx="61" cy="116" rx="8" ry="12" fill="url(#vogDiscGrad)" stroke="#92400E" strokeWidth="1.2" />

                {/* Left flowing fluted base pillar */}
                <path
                  d="M58 126 C62 134 68 143 75 152 L73 166 C65 156 58 144 53 133 C55 130 57 128 58 126 Z"
                  fill="url(#vogGoldGrad)"
                  stroke="#78350F"
                  strokeWidth="0.8"
                />

                {/* Middle flowing fluted stem */}
                <path
                  d="M87 132 C91 144 95 156 100 168 L92 174 C86 161 82 148 78 135 C81 133 84 133 87 132 Z"
                  fill="url(#vogGoldGrad)"
                  stroke="#78350F"
                  strokeWidth="0.8"
                />

                {/* Right flowing wing plume */}
                <path
                  d="M110 126 C118 138 127 149 138 160 C146 150 152 137 157 122 C150 134 142 145 132 153 C124 143 118 132 113 120 L110 126 Z"
                  fill="url(#vogGoldGrad)"
                  stroke="#78350F"
                  strokeWidth="0.8"
                />

                {/* Lustrous metallic specular reflections */}
                <path
                  d="M108 43 C120 45 135 48 153 54 C140 68 129 82 118 96 C125 86 133 76 142 66 C130 60 119 52 108 43 Z"
                  fill="url(#vogGoldHighlight)"
                />
              </g>

              {/* Bottom Subtle VOG Typography Accent */}
              <text
                x="100"
                y="190"
                textAnchor="middle"
                fontSize="12"
                fontWeight="900"
                fill="#FFFFFF"
                letterSpacing="3"
                fontFamily="system-ui, sans-serif"
                opacity="0.9"
              >
                VOG
              </text>
            </svg>
          </div>
        )}

        {showText && (
          <div className="flex flex-col text-left">
            <span className="text-xs uppercase tracking-wider font-extrabold text-blue-900 leading-none">
              VESSEL OF GRACE
            </span>
            <span className="text-[10px] font-semibold text-slate-500 tracking-tight leading-tight">
              CHRISTIAN CENTER
            </span>
          </div>
        )}
      </div>

      {/* Quick Logo Customizer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Official VOG Logo Setup</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3">
              The application defaults to the official 3D Gold, Red, and Royal Blue VOG emblem. You can also upload a custom graphic or paste an image URL.
            </p>

            <form onSubmit={handleSaveLogo} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Logo File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Or Paste Direct Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/vog-logo.png"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {customLogoUrl ? (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Reset to Official VOG Emblem
                  </button>
                ) : <span />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-xl hover:bg-blue-800"
                  >
                    Save Logo
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
