// A small illustrated portrait for each character, drawn in SVG so it needs no image files.
import { PET_ROSTER } from '../lib/pets';
import type { PetLook } from '../lib/petWorld';

type Hat = 'fedora' | 'flat' | 'slick' | 'bun' | 'helmet' | 'beret' | 'cap' | 'bald';

type Look = {
  skin: string;
  hair: string;
  suit: string; // jacket
  accent: string; // tie, scarf or trim
  bg: string;
  hat: Hat;
  hatColor: string;
  shades?: boolean;
  stache?: boolean;
  glasses?: boolean;
};

const LOOKS: Record<string, Look> = {
  'don-biscotti': { skin: '#E8B98F', hair: '#9AA0A6', suit: '#2B2F4A', accent: '#D9435A', bg: '#3A2447', hat: 'fedora', hatColor: '#1E1F2B', stache: true },
  'sal-pigeon': { skin: '#D9A07A', hair: '#3A2A22', suit: '#6B7480', accent: '#F2C14E', bg: '#1F3B4D', hat: 'cap', hatColor: '#6B7480' },
  'mr-ledger': { skin: '#F0C8A5', hair: '#5B4636', suit: '#3C3F44', accent: '#4FD1C5', bg: '#243B3B', hat: 'slick', hatColor: '#5B4636', glasses: true },
  'velvet-lou': { skin: '#9B6A4C', hair: '#1B1B20', suit: '#6A2C70', accent: '#FF6EC7', bg: '#2E1F47', hat: 'slick', hatColor: '#1B1B20', shades: true, stache: true },
  'gruff-gus': { skin: '#C98E6B', hair: '#2A2A2E', suit: '#22262E', accent: '#E0E0E0', bg: '#2B2F3A', hat: 'bald', hatColor: '#C98E6B', shades: true },
  'nonna-pesto': { skin: '#F0CDB0', hair: '#E6E6EA', suit: '#2E6B5A', accent: '#F2C14E', bg: '#3A2F45', hat: 'bun', hatColor: '#E6E6EA', glasses: true },
  'dapper-dom': { skin: '#B07A58', hair: '#16161B', suit: '#B83A5C', accent: '#FFE08A', bg: '#27352F', hat: 'fedora', hatColor: '#F3E9D2', shades: false, stache: true },
  'big-pretzel': { skin: '#E3AE87', hair: '#6B3E25', suit: '#1E2A3A', accent: '#FF8A3D', bg: '#3C2F27', hat: 'flat', hatColor: '#3C4A5C' },
  'turbo-tess': { skin: '#E5B08A', hair: '#E4572E', suit: '#FF4F8B', accent: '#00E5FF', bg: '#1D2B53', hat: 'helmet', hatColor: '#FF4F8B', shades: true },
  'chrome-charlie': { skin: '#C99774', hair: '#2B2B2B', suit: '#7C8A99', accent: '#FFD23F', bg: '#2E3A3E', hat: 'cap', hatColor: '#FFD23F', stache: true },
  'neon-nadia': { skin: '#F0C7A8', hair: '#6EE7F9', suit: '#1B1F3B', accent: '#B388FF', bg: '#17122E', hat: 'slick', hatColor: '#6EE7F9', glasses: true },
  'skates-mcgee': { skin: '#8D5B3E', hair: '#222', suit: '#2EC4B6', accent: '#FFBF69', bg: '#26324A', hat: 'beret', hatColor: '#FF6B6B' },
  'miss-mirage': { skin: '#F3D2B8', hair: '#B388FF', suit: '#8E44AD', accent: '#F9E27D', bg: '#291B3D', hat: 'fedora', hatColor: '#8E44AD', shades: true },
  'sunny-sundae': { skin: '#E8B98F', hair: '#F4C542', suit: '#FFD166', accent: '#EF476F', bg: '#33433B', hat: 'beret', hatColor: '#EF476F', shades: true },
  'doc-dime': { skin: '#D9A07A', hair: '#B5B5B5', suit: '#EDEDED', accent: '#2C7BE5', bg: '#3A3F4B', hat: 'bald', hatColor: '#D9A07A', glasses: true, stache: true },
  'rocket-rita': { skin: '#B07A58', hair: '#2B1B12', suit: '#F4A259', accent: '#5BC0EB', bg: '#1F3B4D', hat: 'helmet', hatColor: '#F4A259', shades: true },
};

const FALLBACK_IDS = PET_ROSTER.map((p) => p.id as string);

/** Pets saved by the earlier version have ids that are not in the roster. Give them a stable look instead of nothing. */
function resolve(id: string): { key: string; look: Look } {
  if (LOOKS[id]) return { key: id, look: LOOKS[id] };
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const key = FALLBACK_IDS[h % FALLBACK_IDS.length];
  return { key, look: LOOKS[key] };
}

function HatBack({ l }: { l: Look }) {
  if (l.hat === 'bun') return <circle cx="50" cy="14" r="11" fill={l.hair} />;
  if (l.hat === 'slick' || l.hat === 'bald') return null;
  return null;
}

function HatFront({ l }: { l: Look }) {
  switch (l.hat) {
    case 'fedora':
      return (
        <>
          <ellipse cx="50" cy="36" rx="38" ry="8" fill={l.hatColor} />
          <path d="M26 36c0-20 8-28 24-28s24 8 24 28z" fill={l.hatColor} />
          <rect x="26" y="29" width="48" height="6" fill={l.accent} />
        </>
      );
    case 'flat':
      return (
        <>
          <path d="M20 38c2-18 18-22 34-20 14 2 24 8 26 20z" fill={l.hatColor} />
          <path d="M18 38h62c-4 5-14 6-30 6s-28-1-32-6z" fill={l.hatColor} opacity="0.85" />
        </>
      );
    case 'cap':
      return (
        <>
          <path d="M22 38c0-18 12-26 28-26s28 8 28 26z" fill={l.hatColor} />
          <path d="M52 36h40c-2 6-14 9-40 6z" fill={l.hatColor} opacity="0.8" />
        </>
      );
    case 'beret':
      return <ellipse cx="46" cy="26" rx="32" ry="13" fill={l.hatColor} transform="rotate(-8 46 26)" />;
    case 'helmet':
      return (
        <>
          <path d="M18 46c0-26 14-36 32-36s32 10 32 36z" fill={l.hatColor} />
          <rect x="18" y="42" width="64" height="5" fill={l.accent} opacity="0.9" />
        </>
      );
    case 'slick':
      return <path d="M19 44c-2-24 12-32 31-32s33 8 31 32c-6-12-18-16-31-16s-25 4-31 16z" fill={l.hair} />;
    case 'bun':
      return <path d="M19 46c-2-22 12-30 31-30s33 8 31 30c-8-12-18-16-31-16s-23 4-31 16z" fill={l.hair} />;
    default:
      return null;
  }
}

function CrewAvatar({ id, name, size = 40 }: { id: string; name?: string; size?: number }) {
  const { look: l } = resolve(id);
  return (
    <svg
      className="catavatar"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={name ? `${name}, a cartoon character` : 'A cartoon character'}
      style={{ borderRadius: '50%', flex: 'none' }}
    >
      <rect width="100" height="100" fill={l.bg} />
      {/* neon city skyline behind */}
      <path d="M0 78v-18h10v-8h10v14h8v-10h10v22zM66 78v-16h9v-10h10v12h8v-6h8v26z" fill="#fff" opacity="0.06" />
      <HatBack l={l} />
      {/* shoulders and jacket */}
      <path d="M6 100c2-18 16-26 44-26s42 8 44 26z" fill={l.suit} />
      <path d="M38 76l12 14 12-14z" fill="#F4F4F2" />
      <path d="M50 80l-4 18h8z" fill={l.accent} />
      {/* neck and head */}
      <rect x="42" y="66" width="16" height="12" fill={l.skin} />
      <ellipse cx="50" cy="52" rx="26" ry="28" fill={l.skin} />
      <ellipse cx="24.5" cy="54" rx="3.5" ry="5.5" fill={l.skin} />
      <ellipse cx="75.5" cy="54" rx="3.5" ry="5.5" fill={l.skin} />
      {l.hat === 'bald' && <ellipse cx="42" cy="34" rx="12" ry="5" fill="#fff" opacity="0.18" />}
      {/* eyes */}
      {l.shades ? (
        <>
          <rect x="27" y="46" width="21" height="11" rx="4" fill="#0b0b10" />
          <rect x="52" y="46" width="21" height="11" rx="4" fill="#0b0b10" />
          <rect x="47" y="49" width="6" height="2.5" fill="#0b0b10" />
          <path d="M30 49l8 0M55 49l8 0" stroke={l.accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
        </>
      ) : (
        <>
          <ellipse cx="38" cy="51" rx="4.2" ry="4.6" fill="#fff" />
          <ellipse cx="62" cy="51" rx="4.2" ry="4.6" fill="#fff" />
          <circle cx="38.8" cy="51.6" r="2.4" fill="#1c1c22" />
          <circle cx="62.8" cy="51.6" r="2.4" fill="#1c1c22" />
          <path d="M31 43l13 2M69 43l-13 2" stroke={l.hair} strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}
      {l.glasses && (
        <>
          <circle cx="38" cy="51" r="8" fill="none" stroke="#14141a" strokeWidth="1.8" />
          <circle cx="62" cy="51" r="8" fill="none" stroke="#14141a" strokeWidth="1.8" />
          <path d="M46 51h8" stroke="#14141a" strokeWidth="1.8" />
        </>
      )}
      {/* nose, moustache, mouth */}
      <path d="M50 53c-3 5-4 8 0 8s3-3 0-8z" fill="#000" opacity="0.14" />
      {l.stache && <path d="M34 66c5-6 12-5 16-2 4-3 11-4 16 2-6 2-12 1-16-1-4 2-10 3-16 1z" fill={l.hair === '#9AA0A6' || l.hair === '#B5B5B5' ? '#d7d7db' : l.hair} />}
      <path d="M41 71c5 4 13 4 18 0" stroke="#5b2a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <HatFront l={l} />
      {/* neon rim light */}
      <circle cx="50" cy="50" r="48" fill="none" stroke={l.accent} strokeOpacity="0.55" strokeWidth="2" />
    </svg>
  );
}

/** One portrait component for every character. Unknown ids get a stable look picked from the roster. */
export default function PetAvatar({ id, name, size = 40 }: { id: string; name?: string; size?: number }) {
  return <CrewAvatar id={id} name={name} size={size} />;
}

/** Colors and shapes for the animated street scene. */
export function petLook(id: string): PetLook {
  const { look: l } = resolve(id);
  return {
    skin: l.skin,
    hair: l.hair,
    suit: l.suit,
    accent: l.accent,
    hat: l.hat,
    hatColor: l.hatColor,
    shades: !!l.shades,
    armed: true,
  };
}
