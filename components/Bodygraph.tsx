'use client';

import { PlanetaryTransits } from '@/lib/hdCalculations';
import { useEffect, useRef, useState } from 'react';

interface BodygraphProps {
  transits: PlanetaryTransits;
}

export default function Bodygraph({ transits }: BodygraphProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  // Collect all activated gates from transits
  const activatedGates = new Set<number>();
  Object.values(transits).forEach(activation => {
    activatedGates.add(activation.gate);
  });

  useEffect(() => {
    // Load the base SVG
    fetch('/bodygraph-base.svg')
      .then(res => res.text())
      .then(svg => {
        // Parse and modify the SVG to highlight activated gates
        let modifiedSvg = svg;
        
        // Replace white fills with dark background for centers
        modifiedSvg = modifiedSvg.replace(/fill="#fff"/g, 'fill="#2a2a2a"');
        
        // Highlight activated gates by changing their fill color
        activatedGates.forEach(gate => {
          const gatePattern = new RegExp(`id="Gate${gate}"([^>]*?)fill="([^"]*)"`, 'g');
          modifiedSvg = modifiedSvg.replace(gatePattern, `id="Gate${gate}"$1fill="#d4af37"`);
        });
        
        // Make stroke visible (gold color)
        modifiedSvg = modifiedSvg.replace(/stroke="transparent"/g, 'stroke="#555"');
        
        // Add proper sizing attributes to the SVG tag
        modifiedSvg = modifiedSvg.replace(
          /<svg/,
          '<svg style="width: 100%; height: 100%; max-width: 450px; max-height: 650px; margin: 0 auto;"'
        );
        
        // Update the SVG
        setSvgContent(modifiedSvg);
      });
  }, [transits]);

  return (
    <div 
      ref={svgRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{
        filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.2))',
        maxWidth: '500px',
        maxHeight: '700px',
        margin: '0 auto'
      }}
    />
  );
}
