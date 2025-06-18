import React, { useEffect, useRef, createElement } from 'react';
import Card from '../ui/Card';
interface WorldMapProps {
  data: Array<{
    country: string;
    value: number;
  }>;
  title: string;
  className?: string;
}
const WorldMap: React.FC<WorldMapProps> = ({
  data,
  title,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // This is a simplified world map representation
  // In a real app, you would use a mapping library like Leaflet
  useEffect(() => {
    if (mapRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = mapRef.current.offsetWidth;
      canvas.height = mapRef.current.offsetHeight;
      mapRef.current.innerHTML = '';
      mapRef.current.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Draw a simplified world map
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw continents (simplified shapes)
      ctx.fillStyle = '#334155';
      // North America
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.1, canvas.height * 0.2);
      ctx.lineTo(canvas.width * 0.3, canvas.height * 0.2);
      ctx.lineTo(canvas.width * 0.25, canvas.height * 0.5);
      ctx.lineTo(canvas.width * 0.15, canvas.height * 0.5);
      ctx.fill();
      // South America
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.25, canvas.height * 0.5);
      ctx.lineTo(canvas.width * 0.3, canvas.height * 0.5);
      ctx.lineTo(canvas.width * 0.25, canvas.height * 0.8);
      ctx.lineTo(canvas.width * 0.2, canvas.height * 0.8);
      ctx.fill();
      // Europe
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.45, canvas.height * 0.2);
      ctx.lineTo(canvas.width * 0.55, canvas.height * 0.2);
      ctx.lineTo(canvas.width * 0.55, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.45, canvas.height * 0.35);
      ctx.fill();
      // Africa
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.45, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.55, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.55, canvas.height * 0.6);
      ctx.lineTo(canvas.width * 0.45, canvas.height * 0.6);
      ctx.fill();
      // Asia
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.55, canvas.height * 0.2);
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.2);
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.5);
      ctx.lineTo(canvas.width * 0.55, canvas.height * 0.5);
      ctx.fill();
      // Australia
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.75, canvas.height * 0.6);
      ctx.lineTo(canvas.width * 0.85, canvas.height * 0.6);
      ctx.lineTo(canvas.width * 0.85, canvas.height * 0.7);
      ctx.lineTo(canvas.width * 0.75, canvas.height * 0.7);
      ctx.fill();
      // Draw data points
      data.forEach(point => {
        let x = 0,
          y = 0;
        // Map country names to approximate positions
        switch (point.country.toLowerCase()) {
          case 'usa':
          case 'united states':
            x = canvas.width * 0.2;
            y = canvas.height * 0.3;
            break;
          case 'canada':
            x = canvas.width * 0.2;
            y = canvas.height * 0.2;
            break;
          case 'brazil':
            x = canvas.width * 0.25;
            y = canvas.height * 0.6;
            break;
          case 'uk':
          case 'united kingdom':
            x = canvas.width * 0.45;
            y = canvas.height * 0.25;
            break;
          case 'germany':
            x = canvas.width * 0.5;
            y = canvas.height * 0.25;
            break;
          case 'france':
            x = canvas.width * 0.47;
            y = canvas.height * 0.28;
            break;
          case 'china':
            x = canvas.width * 0.7;
            y = canvas.height * 0.35;
            break;
          case 'japan':
            x = canvas.width * 0.8;
            y = canvas.height * 0.3;
            break;
          case 'india':
            x = canvas.width * 0.65;
            y = canvas.height * 0.4;
            break;
          case 'australia':
            x = canvas.width * 0.8;
            y = canvas.height * 0.65;
            break;
          case 'south africa':
            x = canvas.width * 0.5;
            y = canvas.height * 0.55;
            break;
          default:
            // Random position if country not mapped
            x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
            y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
        }
        // Scale size based on value (normalized)
        const maxValue = Math.max(...data.map(d => d.value));
        const size = 5 + point.value / maxValue * 15;
        // Draw circle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 179, 37, ${0.3 + point.value / maxValue * 0.7})`;
        ctx.fill();
        // Add glow effect
        ctx.beginPath();
        ctx.arc(x, y, size + 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230, 179, 37, 0.2)';
        ctx.fill();
      });
    }
  }, [data]);
  return <Card className={`${className}`} title={title}>
      <div ref={mapRef} className="h-64 w-full relative">
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
          Loading map...
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-30"></span>
          <span className="ml-1 text-xs text-slate-400">Low</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-60"></span>
          <span className="ml-1 text-xs text-slate-400">Medium</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-100"></span>
          <span className="ml-1 text-xs text-slate-400">High</span>
        </div>
      </div>
    </Card>;
};
export default WorldMap;