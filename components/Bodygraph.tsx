'use client';

import { PlanetaryTransits } from '@/lib/hdCalculations';

interface BodygraphProps {
  transits: PlanetaryTransits;
}

export default function Bodygraph({ transits }: BodygraphProps) {
  // Collect all activated gates from transits
  const activatedGates = new Set<number>();
  Object.values(transits).forEach(activation => {
    activatedGates.add(activation.gate);
  });

  // Check if a gate is activated
  const isGateActive = (gate: number) => activatedGates.has(gate);

  return (
    <svg
      viewBox="0 0 400 600"
      className="w-full h-full max-w-md mx-auto"
      style={{ filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))' }}
    >
      {/* Head Center (Triangle - Top) */}
      <polygon
        points="200,50 240,100 160,100"
        fill={isGateActive(64) || isGateActive(61) || isGateActive(63) ? '#e8d88e' : '#2a2a2a'}
        stroke="#d4af37"
        strokeWidth="2"
      />
      <text x="200" y="85" textAnchor="middle" fill="#d4af37" fontSize="10">64</text>
      <text x="180" y="95" textAnchor="middle" fill="#d4af37" fontSize="10">61</text>
      <text x="220" y="95" textAnchor="middle" fill="#d4af37" fontSize="10">63</text>

      {/* Ajna Center (Triangle) */}
      <polygon
        points="200,110 230,150 170,150"
        fill={isGateActive(47) || isGateActive(24) || isGateActive(4) || isGateActive(17) || isGateActive(43) || isGateActive(11) ? '#90c890' : '#2a2a2a'}
        stroke="#d4af37"
        strokeWidth="2"
      />
      <text x="200" y="135" textAnchor="middle" fill="#d4af37" fontSize="10">47</text>

      {/* Throat Center (Square) */}
      <rect
        x="170"
        y="160"
        width="60"
        height="40"
        fill={isGateActive(62) || isGateActive(23) || isGateActive(56) || isGateActive(16) || isGateActive(20) || isGateActive(31) || isGateActive(8) || isGateActive(33) || isGateActive(45) || isGateActive(12) || isGateActive(35) ? '#e8d88e' : '#2a2a2a'}
        stroke="#d4af37"
        strokeWidth="2"
      />
      <text x="200" y="185" textAnchor="middle" fill="#d4af37" fontSize="10">62</text>

      {/* G Center (Square - Diamond shape rotated) */}
      <polygon
        points="200,210 240,250 200,290 160,250"
        fill={isGateActive(1) || isGateActive(13) || isGateActive(25) || isGateActive(46) || isGateActive(2) || isGateActive(15) || isGateActive(10) || isGateActive(7) ? '#90c890' : '#2a2a2a'}
        stroke="#d4af37"
        strokeWidth="2"
      />
      <text x="200" y="255" textAnchor="middle" fill="#d4af37" fontSize="10">G</text>

      {/* Sacral Center (Square) */}
      <rect
        x="170"
        y="300"
        width="60"
        height="60"
        fill={isGateActive(5) || isGateActive(14) || isGateActive(29) || isGateActive(59) || isGateActive(9) || isGateActive(3) || isGateActive(42) || isGateActive(27) || isGateActive(34) ? '#b85450' : '#2a2a2a'}
        stroke="#d4af37"
        strokeWidth="2"
      />
      <text x="200" y="335" textAnchor="middle" fill="#d4af37" fontSize="10">34</text>

      {/* Solar Plexus (Triangle - Right) */}
      <polygon
        points="260,250 310,330 260,330"
        fill={isGateActive(6) || isGateActive(37) || isGateActive(22) || isGateActive(36) || isGateActive(30) || isGateActive(55) || isGateActive(49) ? '#8b6f5f' : '#2a2a2a'}
        stroke="#d4af37"
        strokeWidth="2"
      />
      <text x="275" y="295" textAnchor="middle" fill="#d4af37" fontSize="10">36</text>

      {/* Ego/Heart Center (Triangle) */}
      <polygon
        points="120,240 90,280 150,280"
        fill={isGateActive(21) || isGateActive(40) || isGateActive(26) || isGateActive(51) ? '#b85450' : '#2a2a2a'}
        stroke="#d4af37"
        strokeWidth="2"
      />
      <text x="120" y="270" textAnchor="middle" fill="#d4af37" fontSize="9">21</text>

      {/* Spleen Center (Triangle - Left) */}
      <polygon
        points="140,250 90,330 140,330"
        fill={isGateActive(48) || isGateActive(57) || isGateActive(44) || isGateActive(50) || isGateActive(32) || isGateActive(28) || isGateActive(18) ? '#8b6f5f' : '#2a2a2a'}
        stroke="#d4af37"
        strokeWidth="2"
      />
      <text x="120" y="295" textAnchor="middle" fill="#d4af37" fontSize="10">48</text>

      {/* Root Center (Square - Bottom) */}
      <rect
        x="170"
        y="380"
        width="60"
        height="40"
        fill={isGateActive(58) || isGateActive(38) || isGateActive(54) || isGateActive(53) || isGateActive(60) || isGateActive(52) || isGateActive(19) || isGateActive(39) || isGateActive(41) ? '#e8d88e' : '#2a2a2a'}
        stroke="#d4af37"
        strokeWidth="2"
      />
      <text x="200" y="405" textAnchor="middle" fill="#d4af37" fontSize="10">53</text>

      {/* Channels (simplified - main connections) */}
      {/* Head to Ajna */}
      <line x1="200" y1="100" x2="200" y2="110" stroke="#555" strokeWidth="3" />
      
      {/* Ajna to Throat */}
      <line x1="200" y1="150" x2="200" y2="160" stroke="#555" strokeWidth="3" />
      
      {/* Throat to G */}
      <line x1="200" y1="200" x2="200" y2="210" stroke="#555" strokeWidth="3" />
      
      {/* G to Sacral */}
      <line x1="200" y1="290" x2="200" y2="300" stroke="#555" strokeWidth="3" />
      
      {/* Sacral to Root */}
      <line x1="200" y1="360" x2="200" y2="380" stroke="#555" strokeWidth="3" />

      {/* G to Spleen */}
      <line x1="170" y1="250" x2="140" y2="260" stroke="#555" strokeWidth="2" />
      
      {/* G to Solar Plexus */}
      <line x1="230" y1="250" x2="260" y2="260" stroke="#555" strokeWidth="2" />
      
      {/* Spleen to Sacral */}
      <line x1="140" y1="320" x2="170" y2="330" stroke="#555" strokeWidth="2" />
      
      {/* Solar Plexus to Sacral */}
      <line x1="260" y1="320" x2="230" y2="330" stroke="#555" strokeWidth="2" />

      {/* Ego to Throat */}
      <line x1="130" y1="240" x2="170" y2="180" stroke="#555" strokeWidth="2" />
      
      {/* Ego to G */}
      <line x1="150" y1="260" x2="170" y2="250" stroke="#555" strokeWidth="2" />

      {/* Center Labels */}
      <text x="200" y="75" textAnchor="middle" fill="#888" fontSize="9">Head</text>
      <text x="200" y="140" textAnchor="middle" fill="#888" fontSize="9">Ajna</text>
      <text x="200" y="178" textAnchor="middle" fill="#888" fontSize="9">Throat</text>
      <text x="85" y="265" textAnchor="middle" fill="#888" fontSize="8">Ego</text>
      <text x="320" y="295" textAnchor="middle" fill="#888" fontSize="8">S.Plex</text>
      <text x="80" y="310" textAnchor="middle" fill="#888" fontSize="8">Spleen</text>
      <text x="200" y="350" textAnchor="middle" fill="#888" fontSize="9">Sacral</text>
      <text x="200" y="398" textAnchor="middle" fill="#888" fontSize="9">Root</text>
    </svg>
  );
}
