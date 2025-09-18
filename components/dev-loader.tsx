"use client"

import React, { useEffect, useState } from "react";

const DevLoader = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex flex-col items-center justify-center transition-colors duration-500">
      <div className="flex flex-col items-center justify-center gap-8">
        
        {/* Astronaute / Rocket */}
        <div className="relative w-40 h-40">
          {/* Corps de la fusée */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-12 h-20 bg-gray-300 dark:bg-slate-600 rounded-t-lg">
            {/* Hublot */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-400 dark:bg-blue-500 rounded-full"></div>
          </div>
          
          {/* Casque d'astronaute */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gray-200 dark:bg-slate-500 rounded-full border-4 border-gray-300 dark:border-slate-600">
            {/* Visière réfléchissante */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-10 h-6 bg-gradient-to-r from-blue-300 to-blue-500 dark:from-blue-500 dark:to-blue-700 rounded-full"></div>
          </div>
          
          {/* Propulseurs */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2">
            <div className="w-4 h-8 bg-orange-500 dark:bg-orange-600 rounded-t-lg animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-10 bg-orange-500 dark:bg-orange-600 rounded-t-lg animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-4 h-8 bg-orange-500 dark:bg-orange-600 rounded-t-lg animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Étoiles filantes */}
          <div className="absolute top-2 -left-4 w-2 h-2 bg-yellow-300 rounded-full animate-star-shoot"></div>
          <div className="absolute top-8 -right-6 w-2 h-2 bg-blue-300 rounded-full animate-star-shoot" style={{ animationDelay: '1.2s' }}></div>
          <div className="absolute top-16 -left-8 w-2 h-2 bg-yellow-300 rounded-full animate-star-shoot" style={{ animationDelay: '0.7s' }}></div>
        </div>

        {/* Éléments orbitaux / Accélérateur */}
        <div className="relative w-64 h-64">
          {/* Orbite externe */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-700 animate-spin-slow">
            {/* Satellite */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-3 bg-blue-500 dark:bg-blue-600 rounded-full"></div>
          </div>
          
          {/* Orbite moyenne */}
          <div className="absolute inset-8 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-700 animate-spin-slow" style={{ animationDirection: 'reverse' }}>
            {/* Planète */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 dark:bg-green-600 rounded-full"></div>
          </div>
          
          {/* Orbite interne */}
          <div className="absolute inset-16 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-700 animate-spin-slow">
            {/* Étoile */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-yellow-300 dark:bg-yellow-500 rounded-full"></div>
          </div>
          
          {/* Points d'accélération */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-4">
            <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
        
        {/* Éléments décoratifs */}
        <div className="flex gap-6">
          <div className="w-4 h-4 bg-purple-400 dark:bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-5 h-5 bg-blue-400 dark:bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-4 h-4 bg-green-400 dark:bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
      
      {/* Styles d'animation personnalisés */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes star-shoot {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(40px, 40px) scale(0.2); opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-star-shoot {
          animation: star-shoot 2s ease-in infinite;
        }
      `}</style>
    </div>
  );
};

export default DevLoader;