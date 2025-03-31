import React, { useEffect, useRef } from 'react';
import Logo from './Logo';

interface ImageSectionProps {
  position?: 'left' | 'right';
  logo?: 'left' | 'right';
}

const ImageSection = ({ position = 'left', logo = 'left' }: ImageSectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // This creates the red circle programmatically
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas dimensions to match the parent container
        const resizeCanvas = () => {
          const parent = canvas.parentElement;
          if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            
            // Draw the red circle
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.4;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#C10E0E';
            ctx.fill();
          }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }
  }, []);
  
  return (
    <div className={`relative flex flex-col bg-black overflow-hidden ${position === 'right' ? 'order-2' : 'order-1'}`}>
      <div className={`absolute top-6 ${logo === 'right' ? 'right-6' : 'left-6'} z-10`}>
        <Logo />
      </div>
      
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
      
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <img 
          src="/pics/statue.png" 
          alt="Greek statue" 
          className="object-contain max-h-[100%] max-w-[100%] animate-fade-in" 
        />
      </div>
    </div>
  );
};

export default ImageSection;
