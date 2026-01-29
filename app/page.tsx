'use client';

import { useEffect, useState } from 'react';
import { formatActivation, getPlanetName, type PlanetaryTransits } from '@/lib/hdCalculations';

interface TransitResponse {
  success: boolean;
  date: string;
  transits: PlanetaryTransits;
}

export default function Home() {
  const [transits, setTransits] = useState<PlanetaryTransits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const fetchTransits = async (date?: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const dateParam = date ? `?date=${date.toISOString()}` : '';
      const response = await fetch(`/api/transits${dateParam}`);
      const data: TransitResponse = await response.json();
      
      if (data.success) {
        setTransits(data.transits);
      } else {
        setError('Failed to load transits');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransits();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Calculating transits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => fetchTransits()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            Human Design Transits
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Current Planetary Positions • {currentDate.toLocaleString()}
          </p>
          <button
            onClick={() => fetchTransits()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            🔄 Refresh Now
          </button>
        </div>

        {/* Transit Grid */}
        {transits && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(transits) as Array<keyof PlanetaryTransits>).map((planet) => {
              const activation = transits[planet];
              return (
                <div
                  key={planet}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-indigo-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {getPlanetName(planet)}
                    </h3>
                    <span className="text-3xl">
                      {getPlanetEmoji(planet)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Gate</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {activation.gate}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Line</span>
                      <span className="text-xl font-semibold text-purple-600">
                        {activation.line}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Color</span>
                      <span className="text-lg font-medium text-pink-600">
                        {activation.color}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Tone</span>
                      <span className="text-lg font-medium text-orange-600">
                        {activation.tone}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-500">Base</span>
                      <span className="text-lg font-medium text-teal-600">
                        {activation.base}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-500 font-mono">
                      {formatActivation(activation, 5)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by Swiss Ephemeris • Built with ❤️ for Human Design</p>
        </div>
      </div>
    </div>
  );
}

function getPlanetEmoji(planet: keyof PlanetaryTransits): string {
  const emojis: Record<keyof PlanetaryTransits, string> = {
    sun: '☀️',
    earth: '🌍',
    moon: '🌙',
    northNode: '⬆️',
    southNode: '⬇️',
    mercury: '☿️',
    venus: '♀️',
    mars: '♂️',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇'
  };
  return emojis[planet] || '🪐';
}
