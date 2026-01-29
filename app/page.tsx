'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addHours, subHours, addDays, subDays } from 'date-fns';
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timelineOffset, setTimelineOffset] = useState(0); // hours from now

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

  const quickJump = (days: number) => {
    const newDate = days > 0 ? addDays(new Date(), days) : subDays(new Date(), Math.abs(days));
    const hoursDiff = Math.round((newDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));
    setTimelineOffset(hoursDiff);
    fetchTransits(newDate);
  };

  if (loading && !transits) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Calculating transits...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg max-w-md`}
        >
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{error}</p>
          <button
            onClick={() => fetchTransits(new Date())}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
              Human Design Transits
            </h1>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700'} shadow-md hover:shadow-lg`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          <p className={`text-lg md:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            {format(selectedDate, 'MMMM d, yyyy • h:mm a')}
          </p>

          {/* Quick Jump Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <button onClick={() => quickJump(-7)} className={`px-3 py-1 text-sm rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} shadow hover:shadow-md transition-all`}>
              -7 days
            </button>
            <button onClick={() => quickJump(-1)} className={`px-3 py-1 text-sm rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} shadow hover:shadow-md transition-all`}>
              -1 day
            </button>
            <button onClick={() => { setTimelineOffset(0); fetchTransits(new Date()); }} className="px-4 py-1 text-sm rounded-lg bg-indigo-600 text-white shadow hover:shadow-md transition-all font-semibold">
              NOW
            </button>
            <button onClick={() => quickJump(1)} className={`px-3 py-1 text-sm rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} shadow hover:shadow-md transition-all`}>
              +1 day
            </button>
            <button onClick={() => quickJump(7)} className={`px-3 py-1 text-sm rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} shadow hover:shadow-md transition-all`}>
              +7 days
            </button>
          </div>

          {/* Date/Time Picker */}
          <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
            <input
              type="datetime-local"
              className={`px-4 py-2 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
              value={format(selectedDate, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => jumpToDate(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Timeline Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {timelineOffset < 0 ? `${Math.abs(timelineOffset)}h ago` : timelineOffset > 0 ? `+${timelineOffset}h` : 'Current time'}
            </span>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Timeline Slider
            </span>
          </div>
          <input
            type="range"
            min="-168"
            max="168"
            value={timelineOffset}
            onChange={(e) => handleTimelineChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(to right, #4f46e5, #7c3aed, #ec4899)'
                : 'linear-gradient(to right, #c7d2fe, #ddd6fe, #fbcfe8)'
            }}
          />
          <div className="flex justify-between mt-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>-7 days</span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>+7 days</span>
          </div>
        </motion.div>

        {/* Transit Grid */}
        {transits && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {(Object.keys(transits) as Array<keyof PlanetaryTransits>).map((planet, index) => {
                const activation = transits[planet];
                return (
                  <motion.div
                    key={planet}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' : 'bg-white hover:border-indigo-300'} rounded-xl shadow-lg p-5 hover:shadow-xl transition-all border-2 border-transparent`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {getPlanetName(planet)}
                      </h3>
                      <span className="text-3xl">
                        {getPlanetEmoji(planet)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`flex justify-between items-center py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gate</span>
                        <span className="text-2xl font-bold text-indigo-500">
                          {activation.gate}
                        </span>
                      </div>
                      
                      <div className={`flex justify-between items-center py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Line</span>
                        <span className="text-xl font-semibold text-purple-500">
                          {activation.line}
                        </span>
                      </div>
                      
                      <div className={`flex justify-between items-center py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Color</span>
                        <span className="text-lg font-medium text-pink-500">
                          {activation.color}
                        </span>
                      </div>
                      
                      <div className={`flex justify-between items-center py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tone</span>
                        <span className="text-lg font-medium text-orange-500">
                          {activation.tone}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Base</span>
                        <span className="text-lg font-medium text-teal-500">
                          {activation.base}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-center text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatActivation(activation, 5)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mt-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-sm`}
        >
          <p>Powered by Astronomy Engine • Built with ❤️ for Human Design</p>
          <p className="mt-2 text-xs">Accurate astronomical calculations • Gates, Lines, Colors, Tones & Bases</p>
        </motion.div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${isDarkMode ? '#818cf8' : '#4f46e5'};
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${isDarkMode ? '#818cf8' : '#4f46e5'};
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: none;
        }
      `}</style>
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
