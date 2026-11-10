'use client';

import { Sfx } from '@/lib/sounds';

interface Props {
  label: string;
  onClick: () => void;
}

export default function ChipButton({ label, onClick }: Props) {
  return (
    <button
      onClick={() => { Sfx.click(); onClick(); }}
      onMouseEnter={() => Sfx.hover()}
      className="chunk-btn rounded-full border-2 border-[#FFE1B8] bg-cream px-4 py-2 font-display text-sm font-semibold shadow-chunk hover:bg-[#FFE9BC]"
    >
      {label}
    </button>
  );
}
