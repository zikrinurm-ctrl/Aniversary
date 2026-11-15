import React from 'react';

export const GuessPictureScene: React.FC<{ sceneType: string; imageUrl?: string; title: string }> = ({
  sceneType,
  imageUrl,
  title,
}) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title}
        referrerPolicy="no-referrer"
        className="w-full h-56 sm:h-64 object-cover rounded-2xl border border-pink-100"
      />
    );
  }

  const renderSvg = () => {
    switch (sceneType) {
      case 'cake':
        return (
          <g>
            <rect x="75" y="105" width="90" height="45" rx="10" fill="#f9a8d4" stroke="#db2777" strokeWidth="3" />
            <rect x="90" y="75" width="60" height="32" rx="8" fill="#fbcfe8" stroke="#db2777" strokeWidth="3" />
            <rect x="116" y="45" width="8" height="30" rx="3" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
            <path d="M120 26 C128 36, 126 44, 120 44 C114 44, 112 36, 120 26 Z" fill="#fb923c" />
          </g>
        );
      case 'night_sky':
        return (
          <g>
            <rect x="20" y="18" width="200" height="144" rx="18" fill="#312e81" />
            <path d="M90 50 A30 30 0 1 0 120 98 A24 24 0 1 1 90 50 Z" fill="#fde68a" />
            <polygon points="155,44 159,54 170,54 161,60 165,70 155,64 145,70 149,60 140,54 151,54" fill="#fbcfe8" />
            <circle cx="58" cy="54" r="3" fill="#fff" />
            <circle cx="178" cy="112" r="3" fill="#fff" />
            <circle cx="120" cy="128" r="2.5" fill="#f9a8d4" />
          </g>
        );
      case 'camera':
        return (
          <g>
            <rect x="65" y="55" width="110" height="80" rx="16" fill="#fbcfe8" stroke="#be185d" strokeWidth="3" />
            <rect x="95" y="42" width="50" height="15" rx="6" fill="#f472b6" />
            <circle cx="120" cy="95" r="24" fill="#fff" stroke="#be185d" strokeWidth="4" />
            <circle cx="120" cy="95" r="13" fill="#4c1d95" />
            <circle cx="155" cy="70" r="5" fill="#fde047" />
          </g>
        );
      case 'umbrella_rain':
        return (
          <g>
            <path d="M60 95 A60 55 0 0 1 180 95 Z" fill="#f472b6" stroke="#be185d" strokeWidth="3" />
            <path d="M120 95 L120 140 A10 10 0 0 1 100 140" fill="none" stroke="#be185d" strokeWidth="4" strokeLinecap="round" />
            <path d="M65 34 L60 48 M110 24 L105 38 M158 32 L153 46 M182 55 L177 69" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      case 'latte_heart':
        return (
          <g>
            <ellipse cx="120" cy="138" rx="56" ry="12" fill="#fbcfe8" />
            <path d="M78 72 L162 72 L150 132 L90 132 Z" fill="#fff" stroke="#db2777" strokeWidth="3" />
            <path d="M160 82 C178 82, 178 110, 155 112" fill="none" stroke="#db2777" strokeWidth="4" />
            <path d="M120 110 L108 98 A8 8 0 0 1 120 88 A8 8 0 0 1 132 98 Z" fill="#f43f5e" />
          </g>
        );
      case 'rings':
        return (
          <g>
            <circle cx="100" cy="98" r="32" fill="none" stroke="#f59e0b" strokeWidth="8" />
            <circle cx="140" cy="98" r="32" fill="none" stroke="#ec4899" strokeWidth="8" />
            <polygon points="140,56 150,66 140,76 130,66" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" />
          </g>
        );
      case 'rose':
        return (
          <g>
            <path d="M120 92 L120 152" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
            <path d="M120 125 Q142 115 144 128 Q132 138 120 128" fill="#4ade80" />
            <circle cx="120" cy="70" r="28" fill="#f43f5e" />
            <path d="M104 68 Q120 52 136 68 Q120 86 104 68" fill="#fda4af" />
            <circle cx="120" cy="68" r="8" fill="#be123c" />
          </g>
        );
      case 'music_vinyl':
        return (
          <g>
            <circle cx="105" cy="95" r="44" fill="#3b0764" />
            <circle cx="105" cy="95" r="16" fill="#f472b6" />
            <circle cx="105" cy="95" r="5" fill="#fff" />
            <path d="M162 46 L162 104 M162 46 L186 52 L186 98" fill="none" stroke="#db2777" strokeWidth="5" strokeLinecap="round" />
            <circle cx="154" cy="108" r="10" fill="#db2777" />
            <circle cx="178" cy="102" r="10" fill="#db2777" />
          </g>
        );
      case 'padlock':
        return (
          <g>
            <path d="M92 80 L92 60 A28 28 0 0 1 148 60 L148 80" fill="none" stroke="#a855f7" strokeWidth="8" />
            <rect x="78" y="80" width="84" height="64" rx="14" fill="#f472b6" stroke="#be185d" strokeWidth="3" />
            <circle cx="120" cy="106" r="8" fill="#fff" />
            <rect x="116" y="110" width="8" height="16" rx="3" fill="#fff" />
          </g>
        );
      case 'calendar':
        return (
          <g>
            <rect x="68" y="42" width="104" height="100" rx="14" fill="#fff" stroke="#db2777" strokeWidth="3" />
            <rect x="68" y="42" width="104" height="28" rx="10" fill="#f43f5e" />
            <text x="120" y="61" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">NOVEMBER</text>
            <text x="120" y="115" textAnchor="middle" fill="#be185d" fontSize="34" fontWeight="bold">20</text>
          </g>
        );
      case 'ice_cream':
        return (
          <g>
            <polygon points="96,95 144,95 120,152" fill="#fed7aa" stroke="#ea580c" strokeWidth="3" />
            <circle cx="106" cy="80" r="18" fill="#f9a8d4" />
            <circle cx="134" cy="80" r="18" fill="#d8b4fe" />
            <circle cx="120" cy="60" r="18" fill="#fda4af" />
            <circle cx="120" cy="39" r="6" fill="#e11d48" />
          </g>
        );
      case 'home_heart':
        return (
          <g>
            <polygon points="120,38 58,88 182,88" fill="#f472b6" stroke="#be185d" strokeWidth="3" />
            <rect x="74" y="88" width="92" height="58" rx="6" fill="#fff1f2" stroke="#be185d" strokeWidth="3" />
            <path d="M120 132 L106 118 A9 9 0 0 1 120 107 A9 9 0 0 1 134 118 Z" fill="#e11d48" />
          </g>
        );
      case 'cinema':
        return (
          <g>
            <rect x="52" y="34" width="136" height="72" rx="10" fill="#312e81" stroke="#a855f7" strokeWidth="3" />
            <polygon points="110,56 138,70 110,84" fill="#fbcfe8" />
            <rect x="92" y="116" width="56" height="34" rx="6" fill="#fb7185" />
            <circle cx="106" cy="114" r="9" fill="#fef08a" />
            <circle cx="122" cy="110" r="10" fill="#fef08a" />
            <circle cx="136" cy="115" r="8" fill="#fef08a" />
          </g>
        );
      case 'scooter':
        return (
          <g>
            <circle cx="76" cy="126" r="18" fill="#4c1d95" />
            <circle cx="76" cy="126" r="8" fill="#fff" />
            <circle cx="164" cy="126" r="18" fill="#4c1d95" />
            <circle cx="164" cy="126" r="8" fill="#fff" />
            <path d="M74 112 Q105 92 135 112 L152 72 L166 72" fill="none" stroke="#ec4899" strokeWidth="10" strokeLinecap="round" />
            <rect x="82" y="90" width="38" height="12" rx="6" fill="#be185d" />
          </g>
        );
      case 'clock':
        return (
          <g>
            <circle cx="120" cy="90" r="48" fill="#fff" stroke="#ec4899" strokeWidth="6" />
            <line x1="120" y1="90" x2="120" y2="58" stroke="#be185d" strokeWidth="5" strokeLinecap="round" />
            <line x1="120" y1="90" x2="146" y2="90" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
            <circle cx="120" cy="90" r="5" fill="#be185d" />
          </g>
        );
      case 'teacup':
        return (
          <g>
            <rect x="75" y="84" width="76" height="46" rx="18" fill="#fbcfe8" stroke="#db2777" strokeWidth="3" />
            <path d="M151 94 C168 94, 168 118, 151 118" fill="none" stroke="#db2777" strokeWidth="4" />
            <path d="M100 68 Q94 54 104 44 M124 68 Q118 54 128 44" fill="none" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="113" cy="136" rx="52" ry="8" fill="#f9a8d4" />
          </g>
        );
      case 'little_world':
        return (
          <g>
            <circle cx="120" cy="90" r="44" fill="#a5f3fc" stroke="#7c3aed" strokeWidth="3" />
            <path d="M95 75 Q115 62 132 80 Q118 96 95 75 Z" fill="#86efac" />
            <path d="M126 105 Q148 96 150 116 Q130 125 126 105 Z" fill="#86efac" />
            <path d="M120 42 L112 34 A6 6 0 0 1 120 26 A6 6 0 0 1 128 34 Z" fill="#f43f5e" />
          </g>
        );
      case 'gift_box':
        return (
          <g>
            <rect x="74" y="72" width="92" height="70" rx="10" fill="#f9a8d4" stroke="#be185d" strokeWidth="3" />
            <rect x="68" y="58" width="104" height="20" rx="6" fill="#f472b6" stroke="#be185d" strokeWidth="3" />
            <rect x="112" y="58" width="16" height="84" fill="#fde68a" />
            <circle cx="108" cy="48" r="10" fill="none" stroke="#fde047" strokeWidth="4" />
            <circle cx="132" cy="48" r="10" fill="none" stroke="#fde047" strokeWidth="4" />
          </g>
        );
      case 'fireworks':
        return (
          <g>
            <rect x="20" y="18" width="200" height="144" rx="18" fill="#4c1d95" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={120 + Math.cos(rad) * 12}
                  y1={84 + Math.sin(rad) * 12}
                  x2={120 + Math.cos(rad) * 44}
                  y2={84 + Math.sin(rad) * 44}
                  stroke="#f9a8d4"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx="120" cy="84" r="7" fill="#fde047" />
          </g>
        );
      case 'strawberry':
        return (
          <g>
            <path d="M84 74 C84 52, 156 52, 156 74 C156 112, 128 142, 120 144 C112 142, 84 112, 84 74 Z" fill="#f43f5e" />
            <path d="M98 58 L120 42 L142 58 L120 66 Z" fill="#22c55e" />
            <circle cx="108" cy="82" r="2.5" fill="#fef08a" />
            <circle cx="130" cy="86" r="2.5" fill="#fef08a" />
            <circle cx="118" cy="108" r="2.5" fill="#fef08a" />
          </g>
        );
      case 'paper_plane':
        return (
          <g>
            <polygon points="56,92 184,48 136,134 112,104" fill="#fbcfe8" stroke="#be185d" strokeWidth="3" />
            <line x1="184" y1="48" x2="112" y2="104" stroke="#be185d" strokeWidth="3" />
            <path d="M40 124 Q65 110 82 118" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="5 5" />
          </g>
        );
      case 'rainbow':
        return (
          <g>
            <path d="M52 126 A68 68 0 0 1 188 126" fill="none" stroke="#fb7185" strokeWidth="10" />
            <path d="M62 126 A58 58 0 0 1 178 126" fill="none" stroke="#fdba74" strokeWidth="10" />
            <path d="M72 126 A48 48 0 0 1 168 126" fill="none" stroke="#fde047" strokeWidth="10" />
            <path d="M82 126 A38 38 0 0 1 158 126" fill="none" stroke="#a5f3fc" strokeWidth="10" />
            <path d="M92 126 A28 28 0 0 1 148 126" fill="none" stroke="#d8b4fe" strokeWidth="10" />
          </g>
        );
      case 'teddy':
        return (
          <g>
            <circle cx="84" cy="58" r="18" fill="#d97706" />
            <circle cx="156" cy="58" r="18" fill="#d97706" />
            <circle cx="120" cy="88" r="42" fill="#f59e0b" />
            <ellipse cx="120" cy="100" rx="18" ry="14" fill="#fde68a" />
            <circle cx="105" cy="80" r="4" fill="#3d2532" />
            <circle cx="135" cy="80" r="4" fill="#3d2532" />
            <circle cx="120" cy="94" r="5" fill="#78350f" />
          </g>
        );
      case 'headphones':
        return (
          <g>
            <path d="M70 105 A50 52 0 0 1 170 105" fill="none" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" />
            <rect x="56" y="96" width="22" height="40" rx="10" fill="#ec4899" />
            <rect x="162" y="96" width="22" height="40" rx="10" fill="#ec4899" />
          </g>
        );
      case 'beach':
        return (
          <g>
            <rect x="20" y="18" width="200" height="80" rx="12" fill="#fed7aa" />
            <circle cx="166" cy="56" r="18" fill="#fb7185" />
            <rect x="20" y="94" width="200" height="36" fill="#7dd3fc" />
            <rect x="20" y="124" width="200" height="38" rx="12" fill="#fde68a" />
          </g>
        );
      case 'diary':
        return (
          <g>
            <rect x="76" y="38" width="88" height="106" rx="10" fill="#fbcfe8" stroke="#be185d" strokeWidth="3" />
            <rect x="76" y="38" width="16" height="106" rx="4" fill="#f472b6" />
            <path d="M126 98 L114 86 A7 7 0 0 1 126 76 A7 7 0 0 1 138 86 Z" fill="#e11d48" />
          </g>
        );
      default:
        // butterfly
        return (
          <g>
            <ellipse cx="94" cy="78" rx="28" ry="22" fill="#f9a8d4" />
            <ellipse cx="146" cy="78" rx="28" ry="22" fill="#f9a8d4" />
            <ellipse cx="98" cy="112" rx="22" ry="16" fill="#d8b4fe" />
            <ellipse cx="142" cy="112" rx="22" ry="16" fill="#d8b4fe" />
            <rect x="116" y="64" width="8" height="58" rx="4" fill="#4a2336" />
          </g>
        );
    }
  };

  return (
    <div className="w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-br from-[#fff5f8] to-[#f5eeff] border border-pink-100 flex items-center justify-center p-4">
      <svg viewBox="0 0 240 180" className="w-full h-full max-w-[280px]" role="img" aria-label={title}>
        {renderSvg()}
      </svg>
    </div>
  );
};
