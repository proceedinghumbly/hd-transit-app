'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addHours } from 'date-fns';
import { formatActivation, getPlanetName, type PlanetaryTransits } from '@/lib/hdCalculations';
import Bodygraph from '@/components/Bodygraph';

interface TransitResponse {
  success: boolean;
  date: string;
  transits: PlanetaryTransits;
}

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  earth: '⊕',
  moon: '☽',
  northNode: '☊',
  southNode: '☋',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇'
};

export default function Home() {
  const [transits, setTransits] = useState<PlanetaryTransits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<'transit' | 'about'>('transit');

  const fetchTransits = async (date: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/transits?date=${date.toISOString()}`);
      const data: TransitResponse = await response.json();
      
      if (data.success) {
        setTransits(data.transits);
        setSelectedDate(date);
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
    fetchTransits(new Date());
  }, []);

  const handleTimelineChange = (hours: number) => {
    setTimelineOffset(hours);
    const newDate = addHours(new Date(), hours);
    fetchTransits(newDate);
  };

  const jumpToDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const hoursDiff = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
        setTimelineOffset(hoursDiff);
        fetchTransits(date);
      }
    } catch (e) {
      console.error('Invalid date:', e);
    }
  };

  if (loading && !transits) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-[#d4af37] text-lg">Calculating transits...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-gray-200 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <header className="border-b border-gray-800 bg-[#1a1a1a] flex-shrink-0">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-[#d4af37]">HD Transit</h1>
            <div className="text-sm text-gray-400">
              {format(selectedDate, 'MMM d, yyyy • h:mm a')}
            </div>
          </div>
          <button
            onClick={() => { setTimelineOffset(0); fetchTransits(new Date()); }}
            className="px-3 py-1 bg-[#d4af37] text-black rounded text-sm font-medium hover:bg-[#c4a037] transition-colors"
          >
            Now
          </button>
        </div>
      </header>

      {/* Main Layout - Flex container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Transit List */}
        <aside className="w-48 border-r border-gray-800 bg-[#1a1a1a] p-3 overflow-y-auto flex-shrink-0">
          <h2 className="text-[#d4af37] font-bold text-sm mb-3">Transits</h2>
          
          {transits && (
            <div className="space-y-2">
              {(Object.keys(transits) as Array<keyof PlanetaryTransits>).map((planet) => {
                const activation = transits[planet];
                const symbol = PLANET_SYMBOLS[planet] || '•';
                
                return (
                  <div
                    key={planet}
                    className="flex items-center justify-between py-1.5 border-b border-gray-800 text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#d4af37] text-base w-5">{symbol}</span>
                      <span className="text-gray-400 capitalize text-xs">{planet}</span>
                    </div>
                    <span className="text-[#d4af37] font-bold text-xs">
                      {activation.gate}.{activation.line}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* Center - Bodygraph */}
        <main className="flex-1 flex flex-col items-center justify-center p-2 overflow-hidden">
          <div className="text-center mb-1">
            <h2 className="text-lg font-bold text-[#d4af37]">Transit Chart</h2>
            <p className="text-gray-400 text-xs">
              {timelineOffset === 0 ? 'Now' : 
               timelineOffset > 0 ? `+${timelineOffset}h` : 
               `${timelineOffset}h ago`}
            </p>
          </div>

          {transits && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full flex-1 flex items-center justify-center overflow-hidden"
                style={{ maxHeight: 'calc(100vh - 180px)' }}
              >
                <Bodygraph transits={transits} />
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Right Sidebar - Compact Details Panel */}
        <aside className="w-80 border-l border-gray-800 bg-[#1a1a1a] overflow-y-auto flex-shrink-0">
          {/* Tabs */}
          <div className="border-b border-gray-800 p-3 flex gap-2 sticky top-0 bg-[#1a1a1a] z-10">
            <button
              onClick={() => setActiveTab('transit')}
              className={`px-3 py-1.5 rounded text-xs ${
                activeTab === 'transit' 
                  ? 'bg-[#d4af37] text-black' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } transition-colors font-medium`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded text-xs ${
                activeTab === 'about' 
                  ? 'bg-[#d4af37] text-black' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } transition-colors font-medium`}
            >
              About
            </button>
          </div>

          <div className="p-3">
            {activeTab === 'transit' && transits && (
              <div className="space-y-2">
                {(Object.keys(transits) as Array<keyof PlanetaryTransits>).map((planet) => {
                  const activation = transits[planet];
                  const symbol = PLANET_SYMBOLS[planet] || '•';
                  
                  return (
                    <div key={planet} className="border border-gray-800 rounded p-2 bg-black/30">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#d4af37] text-base">{symbol}</span>
                          <span className="text-white font-medium text-xs capitalize">{getPlanetName(planet)}</span>
                        </div>
                        <span className="text-[#d4af37] font-bold text-sm">
                          {activation.gate}.{activation.line}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <div className="flex gap-1">
                          <span className="text-gray-500">C:</span>
                          <span className="text-gray-300">{activation.color}</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-gray-500">T:</span>
                          <span className="text-gray-300">{activation.tone}</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-gray-500">B:</span>
                          <span className="text-gray-300">{activation.base}</span>
                        </div>
                        <div className="flex-1 text-right">
                          <span className="text-xs text-gray-600 font-mono">
                            {formatActivation(activation, 5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-3">
                <h3 className="text-[#d4af37] font-bold text-sm">About HD Transit</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Real-time Human Design transit calculator showing current planetary positions 
                  through the 64 gates, 6 lines, 6 colors, 6 tones, and 5 bases.
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-gray-800 pb-1.5">
                    <span className="text-gray-500">Engine</span>
                    <span className="text-gray-300">Astronomy</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1.5">
                    <span className="text-gray-500">Accuracy</span>
                    <span className="text-[#d4af37]">Astronomical</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1.5">
                    <span className="text-gray-500">Update</span>
                    <span className="text-gray-300">Real-time</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Timeline - Fixed */}
      <footer className="border-t border-gray-800 bg-[#1a1a1a] px-6 py-2.5 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-24">
              {timelineOffset < 0 ? `${Math.abs(timelineOffset)}h ago` : 
               timelineOffset > 0 ? `+${timelineOffset}h` : 
               'Now'}
            </span>
            
            <div className="flex-1">
              <input
                type="range"
                min="-168"
                max="168"
                value={timelineOffset}
                onChange={(e) => handleTimelineChange(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${((timelineOffset + 168) / 336) * 100}%, #374151 ${((timelineOffset + 168) / 336) * 100}%, #374151 100%)`
                }}
              />
            </div>
            
            <input
              type="datetime-local"
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded border border-gray-700 text-xs"
              value={format(selectedDate, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => jumpToDate(e.target.value)}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-600">
            <span>-7d</span>
            <span>+7d</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </div>
  );
}
