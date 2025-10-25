import React, { useEffect, useState } from 'react';

interface CrosshairProps {
  isActive: boolean;
  onShoot: (x: number, y: number) => void;
}

export const Crosshair: React.FC<CrosshairProps> = ({ isActive, onShoot }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e: MouseEvent) => {
      // Check if the clicked element or any of its parents has the token-sniper-ui-element class
      let target = e.target as Element;
      while (target && target !== document.body) {
        if (target.classList && target.classList.contains('token-sniper-ui-element')) {
          // Allow the click to propagate normally to the UI element
          return;
        }
        target = target.parentElement as Element;
      }
      
      // If we get here, it's not a UI element, so handle as a game shoot action
      e.preventDefault();
      e.stopPropagation(); 
      // Use the exact center of the crosshair for shooting
      onShoot(e.clientX, e.clientY - 100);
    };

    // Hide default cursor and add event listeners
    document.body.style.cursor = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [isActive, onShoot]);

  if (!isActive) return null;

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: position.x - 16, // Center the crosshair exactly
        top: position.y - 16,
        transform: 'none', // No additional transforms
      }}
    >
      <img
        src="https://zrwxctrfycldinkwrjrd.supabase.co/storage/v1/object/sign/website-assets/token-sniper/Crosshairs.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTU0ZTRiZi0wNjk4LTQzOTQtOTllNi0wMjc0NmQ1ZTUzNTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlLWFzc2V0cy90b2tlbi1zbmlwZXIvQ3Jvc3NoYWlycy5zdmciLCJpYXQiOjE3NTQzOTk1NDEsImV4cCI6MjA2OTc1OTU0MX0.xQRpdjrr1-EJ6AYsJrkSzPb9hA-B_onBVgNe8HX4oF0"
        alt="Crosshair"
        className="w-8 h-8 select-none"
        draggable={false}
        style={{
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))'
        }}
      />
    </div>
  );
};