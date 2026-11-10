'use client';

interface Props {
  topics: string[];
  intro?: string;
}

export default function TopicsBanner({ topics, intro }: Props) {
  if (!topics || topics.length === 0) return null;
  return (
    <div className="rounded-3xl border-4 border-sky bg-gradient-to-br from-[#E3F6FF] to-white p-5 shadow-chunk">
      <div className="font-display text-sm font-bold uppercase tracking-wider text-sky-dark" style={{ color: '#0E86AF' }}>
        🎒 This week you&apos;ll learn
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {topics.map((t, i) => (
          <span
            key={i}
            className="rounded-full border-2 border-sky bg-white px-3 py-1 font-display text-sm font-bold text-navy"
          >
            {t}
          </span>
        ))}
      </div>
      {intro ? (
        <p className="mt-3 font-display font-semibold text-navy">{intro}</p>
      ) : null}
    </div>
  );
}
