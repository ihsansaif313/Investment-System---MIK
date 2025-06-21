/**
 * Developer Credits Component
 * Beautiful footer showing development credits
 */

import React, { useState } from 'react';
import { Code, Heart, Zap, ExternalLink, Sparkles } from 'lucide-react';

const DeveloperCredits: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      {/* Main Credits Bar */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 z-40 
          bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 
          backdrop-blur-md border-t border-slate-700/50
          transition-all duration-300 ease-in-out
          ${isHovered ? 'py-4' : 'py-2'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className={`
              flex items-center gap-3 text-sm transition-all duration-300
              ${isHovered ? 'scale-105' : 'scale-100'}
            `}>
              {/* Animated sparkles */}
              <div className="relative">
                <Sparkles 
                  size={16} 
                  className={`
                    text-yellow-400 transition-all duration-300
                    ${isHovered ? 'animate-pulse' : ''}
                  `} 
                />
                {isHovered && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                )}
              </div>

              {/* Main text */}
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Developed by</span>
                <div className="flex items-center gap-1">
                  <Code size={14} className="text-blue-400" />
                  <span className="font-semibold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Eskillvisor
                  </span>
                </div>
              </div>

              {/* Heart animation */}
              <div className="flex items-center gap-1">
                <Heart 
                  size={14} 
                  className={`
                    text-red-400 transition-all duration-300
                    ${isHovered ? 'animate-pulse scale-110' : ''}
                  `}
                  fill={isHovered ? 'currentColor' : 'none'}
                />
              </div>

              {/* Powered by */}
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Powered by</span>
                <div className="flex items-center gap-1">
                  <Zap size={14} className="text-yellow-400" />
                  <span className="font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    MIK Services
                  </span>
                </div>
              </div>

              {/* Animated sparkles */}
              <div className="relative">
                <Sparkles 
                  size={16} 
                  className={`
                    text-yellow-400 transition-all duration-300
                    ${isHovered ? 'animate-pulse' : ''}
                  `} 
                />
                {isHovered && (
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-150" />
                )}
              </div>
            </div>
          </div>

          {/* Expanded content on hover */}
          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isHovered ? 'max-h-20 opacity-100 mt-3' : 'max-h-0 opacity-0'}
          `}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Investment Management System</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75" />
                  <span>Professional Dashboard Solutions</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150" />
                  <span>Enterprise-Grade Analytics</span>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-slate-500">
                © 2024 Eskillvisor & MIK Services. Crafted with precision and innovation.
              </div>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <div className={`
          absolute top-0 left-0 right-0 h-px 
          bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-30'}
        `} />

        {/* Floating particles effect */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400/60 rounded-full animate-float"
                style={{
                  left: `${20 + i * 15}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + i * 0.3}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) scale(1);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DeveloperCredits;
