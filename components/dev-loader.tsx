"use client"

import React, { useEffect, useState } from "react";

const DevLoader = () => {
  const [progress, setProgress] = useState(0);
  const [typingText, setTypingText] = useState('');
  const fullText = "Initializing application...";

  useEffect(() => {
    // Animation de la barre de progression
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 300);

    // Animation du texte qui s'écrit
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setTypingText(fullText.substring(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(typingInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-8">
      {/* Logo avec spinner animé */}
      <div className="relative w-32 h-32">
        {/* Cercle externe */}
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        
        {/* Spinner (cercle animé) */}
        <div 
          className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
          style={{ animationDuration: '1.5s' }}
        ></div>
        
        {/* Logo central */}
        <div className="absolute inset-4 flex items-center justify-center">
          <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-1/2 h-1/2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>



      {/* Console en bas */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gray-800 rounded-md">
          <span className="text-green-400 font-mono text-sm mr-2">$</span>
          <span className="text-gray-100 font-mono text-sm">npm run dev</span>
          <span className="ml-2 inline-block w-2 h-4 bg-green-400 animate-blink" 
                style={{ animationDuration: '1s' }}></span>
        </div>
      </div>
    </div>
  );
};

export default DevLoader;