'use client';

import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, setHours } from 'date-fns';
import { formatActivation, type PlanetaryTransits } from '@/lib/hdCalculations';
import Link from 'next/link';

export default function EphemerisPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [ephemerisData, setEphemerisData] = useState<{ date: Date; transits: PlanetaryTransits }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMonth = async (date: Date) => {
    setLoading(true);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });

    // Fetch transits for each day at noon UTC
    const promises = days.map(async (day) => {
      const noonUTC = setHours(day, 12);
      const response = await fetch(`/api/transits?date=${noonUTC.toISOString()}`);
      const data = await response.json();
      return { date: noonUTC, transits: data.transits };
    });

    const results = await Promise.all(promises);
    setEphemerisData(results);
    setLoading(false);
  };

  useEffect(() => {
    loadMonth(currentMonth);
  }, [currentMonth]);

  const planetKeys: (keyof PlanetaryTransits)[] = [
    'sun', 'earth', 'northNode', 'southNode', 'moon', 
    'mercury', 'venus', 'mars', 'jupiter', 'saturn', 
    'uranus', 'neptune', 'pluto'
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1a1a1a]">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-[#d4af37] hover:text-[#c4a037]">
              HD Transit
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-xl font-bold text-white">Ephemeris</h1>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm"
            >
              ← Prev
            </button>
            <span className="text-[#d4af37] font-bold">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm"
            >
              Next →
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 bg-[#d4af37] text-black rounded font-medium hover:bg-[#c4a037] text-sm ml-2"
            >
              Today
            </button>
          </div>
        </div>
      </header>

      {/* Ephemeris Table */}
      <div className="p-6 overflow-x-auto">
        <div className="max-w-[1800px] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-[#d4af37]">Loading ephemeris...</div>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#2a2a2a] border-b border-gray-800">
                    <th className="px-3 py-2 text-left text-[#d4af37] font-bold sticky left-0 bg-[#2a2a2a]">
                      Date / 12h UTC
                    </th>
                    {planetKeys.map((planet) => (
                      <th key={planet} className="px-2 py-2 text-center text-[#d4af37] font-bold capitalize">
                        {planet.replace('Node', '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ephemerisData.map(({ date, transits }, index) => {
                    const prevTransits = index > 0 ? ephemerisData[index - 1].transits : null;
                    
                    return (
                      <tr
                        key={date.toISOString()}
                        className="border-b border-gray-800 hover:bg-[#1a1a1a]"
                      >
                        <td className="px-3 py-2 text-gray-300 font-medium sticky left-0 bg-[#1a1a1a]">
                          {format(date, 'dd.MM.yyyy HH:mm')}
                        </td>
                        {planetKeys.map((planet) => {
                          const activation = transits[planet];
                          const prevActivation = prevTransits?.[planet];
                          const gateChanged = prevActivation && prevActivation.gate !== activation.gate;
                          
                          return (
                            <td
                              key={planet}
                              className={`px-2 py-2 text-center ${
                                gateChanged ? 'bg-[#d4af37]/20 font-bold text-[#d4af37]' : 'text-gray-300'
                              }`}
                            >
                              {activation.gate}.{activation.line}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-center text-gray-500 text-xs">
            Planetary positions at 12:00 UTC each day • Gate changes highlighted in gold
          </div>
        </div>
      </div>
    </div>
  );
}
