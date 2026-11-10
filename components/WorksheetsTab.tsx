'use client';

import { useState } from 'react';
import practiceData from '@/content/practice.json';
import lessonsData from '@/content/lessons.json';
import { Sfx } from '@/lib/sounds';
import { Download, Archive } from 'lucide-react';

interface Lesson { week: number; title: string; concept: string }
interface Practice { week: number }

export default function WorksheetsTab() {
  const lessons = lessonsData as Lesson[];
  const practices = practiceData as Practice[];
  const [working, setWorking] = useState<string | null>(null);

  const downloadOne = async (week: number) => {
    const p = practices.find((x) => x.week === week);
    const l = lessons.find((x) => x.week === week);
    if (!p || !l) return;
    Sfx.click();
    setWorking(`one-${week}`);
    try {
      const { generateWorksheetPdf } = await import('@/lib/worksheetPdf');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = generateWorksheetPdf(p as any, l);
      doc.save(`week-${week}-worksheet.pdf`);
    } finally {
      setWorking(null);
    }
  };

  const downloadAll = async () => {
    Sfx.click();
    setWorking('all');
    try {
      const { generateWorksheetPdf } = await import('@/lib/worksheetPdf');
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const p of practices) {
        const l = lessons.find((x) => x.week === p.week);
        if (!l) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc = generateWorksheetPdf(p as any, l);
        const blob = doc.output('blob');
        zip.file(`week-${p.week}-worksheet.pdf`, blob);
      }
      const bundle = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(bundle);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'python-fun-world-worksheets.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setWorking(null);
    }
  };

  return (
    <section className="rounded-3xl border-4 border-purple-light bg-white p-5 shadow-chunk">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold">🖨️ Worksheets</h2>
        <button
          onClick={downloadAll}
          disabled={working !== null}
          className="chunk-btn inline-flex items-center gap-2 rounded-full bg-purple px-4 py-3 font-display font-bold text-white shadow-chunk"
        >
          <Archive size={18} />
          {working === 'all' ? 'Zipping…' : 'Download all (zip)'}
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold text-purple-dark">
        One-page A4 PDFs — print and send with the lesson.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {lessons.map((l) => (
          <div
            key={l.week}
            className="flex items-center justify-between rounded-2xl border-2 border-purple-light bg-cream p-3"
          >
            <div>
              <div className="font-display text-sm font-bold text-navy">Week {l.week} — {l.title}</div>
              <div className="font-code text-xs text-purple-dark">{l.concept}</div>
            </div>
            <button
              onClick={() => downloadOne(l.week)}
              disabled={working !== null}
              className="chunk-btn inline-flex items-center gap-1 rounded-full border-2 border-pink bg-white px-3 py-2 font-display text-sm font-bold text-pink-dark"
            >
              <Download size={14} />
              {working === `one-${l.week}` ? '…' : 'PDF'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
