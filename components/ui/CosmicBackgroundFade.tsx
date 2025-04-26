// components/ui/CosmicBackgroundFade.tsx
// Enhanced cosmic background with seamless gradient transitions, improved animations,
// and prominent multicolored symbolic star glyphs that fade irregularly

'use client';

import React, { useEffect, useRef } from 'react';

interface CosmicBackgroundFadeProps {
  isDarkMode?: boolean;
}

export default function CosmicBackgroundFade({ isDarkMode = false }: CosmicBackgroundFadeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match window
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 2.5; // Make taller to accommodate page length
    };
    
    // Initial setup
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Create stars with depth perception
    type Star = {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speed: number;
      xSpeed: number;
      type: 'dot' | 'plus' | 'glyph';
      glyphChar?: string;
      color?: string;
      depth: number;
      pulseRate?: number;
      pulseAmplitude?: number;
      pulseOffset?: number;
      fadeState?: 'in' | 'out';
      fadeRate?: number;
      maxOpacity?: number;
      minOpacity?: number;
    };

    const stars: Star[] = [];
    // Enhanced glyph stars with more variety
    const glyphChars = ['✦', '✧', '✴', '✺', '✸', '★', '☆', '✶', '✹'];
    const glyphColors = [
      '#F472B6', // Pink
      '#60A5FA', // Blue
      '#FCD34D', // Yellow
      '#A78BFA', // Purple
      '#34D399', // Green
      '#FB923C', // Orange
      '#38BDF8', // Sky blue
      '#FB7185'  // Rose
    ];

    // Create stars with different characteristics based on depth
    for (let i = 0; i < 200; i++) {
      const depth = Math.random() * 0.8 + 0.2; // 0.2 (distant) to 1.0 (foreground)
      const isGlyph = Math.random() < 0.05;

      // Adjust star type probability based on depth
      const typeProb = Math.random();
      let type: 'dot' | 'plus' | 'glyph' = 'dot';
      
      if (isGlyph) {
        type = 'glyph';
      } else if (typeProb > 0.8 && depth > 0.6) {
        type = 'plus'; // Plus signs more likely for closer stars
      }

      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        depth,
        radius: isGlyph
          ? (Math.random() * 3 + 2) * depth // Normal glyphs
          : (Math.random() * 1.5 + 0.8) * depth,
        opacity: Math.random() * 0.95 + 0.2,
        speed: (Math.random() * 0.04 + 0.01) * depth,
        xSpeed: (Math.random() - 0.05) * 0.002 * depth,
        type,
        glyphChar: isGlyph ? glyphChars[Math.floor(Math.random() * glyphChars.length)] : undefined,
        color: isGlyph ? glyphColors[Math.floor(Math.random() * glyphColors.length)] : undefined,
        pulseRate: Math.random() * 2 + 1,
        pulseAmplitude: Math.random() * 0.3 + 0.1,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    
    // Create special larger glyph stars that have more pronounced fading
    const specialGlyphChars = ['✧', '✴', '✸', '+', '٭']; // Special characters as requested
    const numSpecialGlyphs = 7; // Add 8 special large glyph stars
    
    for (let i = 0; i < numSpecialGlyphs; i++) {
      const specialChar = specialGlyphChars[Math.floor(Math.random() * specialGlyphChars.length)];
      const specialColor = glyphColors[Math.floor(Math.random() * glyphColors.length)];
      
      // Place these more deliberately across the canvas
      const xPosition = (canvas.width / (numSpecialGlyphs + 1)) * (i + 1) + 
                       (Math.random() * 200 - 100); // Add some randomness
      
      stars.push({
        x: xPosition,
        y: Math.random() * (canvas.height * 0.9), // Spread across the visible area
        depth: 0.9 + Math.random() * 0.1, // Always in the foreground
        radius: Math.random() * 8 + 15, // Much larger (2-3x normal glyphs)
        opacity: 0.01, // Start mostly transparent
        speed: 0.005 + Math.random() * 0.01, // Move very slowly
        xSpeed: (Math.random() - 0.5) * 0.001, // Slight horizontal drift
        type: 'glyph',
        glyphChar: specialChar,
        color: specialColor,
        fadeState: Math.random() > 0.4 ? 'in' : 'out', // Random initial fade direction
        fadeRate: 0.0003 + (Math.random() * 0.0003), // Very slow fade rate (irregular)
        maxOpacity: 0.6 + (Math.random() * 0.3), // Maximum brightness varies
        minOpacity: 0.005 + (Math.random() * 0.01), // Minimum brightness (never fully disappears)
        pulseRate: 0.02 + Math.random() * 0.3, // Very slow pulse rate for secondary animation
        pulseAmplitude: 0.05, // Subtle secondary pulsing
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    
    // Create shooting star system
    type ShootingStar = {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
      tailLength: number;
    };
    
    const shootingStars: ShootingStar[] = [];
    
    // Initialize shooting stars (not active yet)
    for (let i = 0; i < 3; i++) { // Prepare 3 possible shooting stars
      shootingStars.push({
        x: 0,
        y: 0,
        length: 0,
        speed: 0,
        angle: 0, 
        opacity: 0,
        active: false,
        tailLength: 0
      });
    }
    
    // Function to activate a shooting star with random properties
    const activateShootingStar = () => {
      // Find an inactive shooting star
      const inactiveStar = shootingStars.find(star => !star.active);
      if (!inactiveStar) return;
      
      // Randomize angle (mostly diagonal paths look best)
      const angle = (Math.random() * Math.PI / 3) + Math.PI / 6; // Downward angle in the first quadrant
      const flipX = Math.random() > 0.5; // 50% chance to flip horizontally
      
      // Set start position based on angle and canvas size
      let startX, startY;
      if (flipX) {
        // Coming from the right side
        startX = canvas.width + 20;
        startY = Math.random() * (canvas.height / 3);
        inactiveStar.angle = Math.PI - angle;
      } else {
        // Coming from the left side
        startX = -20;
        startY = Math.random() * (canvas.height / 3);
        inactiveStar.angle = angle;
      }
      
      // Configure the shooting star
      inactiveStar.x = startX;
      inactiveStar.y = startY;
      inactiveStar.length = Math.random() * 80 + 100; // Tail length
      inactiveStar.speed = Math.random() * 1 + 6;  // Speed
      inactiveStar.opacity = Math.random() * 0.1 + 0.5;
      inactiveStar.active = true;
      inactiveStar.tailLength = Math.random() * 100 + 300; // Visual tail length
    };
    
    // Schedule shooting stars randomly
    const scheduleNextShootingStar = () => {
      // Random delay between 3-15 seconds
      const nextStarDelay = Math.random() * 14000 + 3000;
      setTimeout(() => {
        activateShootingStar();
        scheduleNextShootingStar(); // Schedule the next one
      }, nextStarDelay);
    };
    
    // Start the shooting star cycle
    scheduleNextShootingStar();


    // Create nebula points with enhanced animation
    const nebulaPoints: {
      x: number;
      y: number;
      baseRadius: number;
      baseOpacity: number;
      pulseOffset: number;
      colorIndex: number;
    }[] = [];

    // Adjust nebula colors based on mode - IMPORTANT: Use proper rgba format
    const nebulaColors = isDarkMode 
      ? [
        'rgba(139, 92, 246, 1)',    // Purple
        'rgba(99, 102, 241, 1)',    // Indigo
        'rgba(236, 72, 153, 1)',    // Pink
        'rgba(16, 185, 129, 1)',    // Emerald
        'rgba(59, 130, 246, 1)',    // Blue
        'rgba(249, 115, 22, 1)'     // Orange
      ] 
      : [
        'rgba(139, 92, 246, 0.5)',  // Purple with transparency
        'rgba(99, 102, 241, 0.5)',  // Indigo with transparency
        'rgba(236, 72, 153, 0.4)',  // Pink with transparency
        'rgba(16, 185, 129, 0.4)',  // Emerald with transparency
        'rgba(59, 130, 246, 0.5)',  // Blue with transparency
        'rgba(249, 115, 22, 0.3)'   // Orange with transparency
      ];
    
    for (let i = 0; i < 20; i++) {
      nebulaPoints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseRadius: Math.random() * 150 + 50,
        baseOpacity: Math.random() * (isDarkMode ? 0.12 : 0.08) + (isDarkMode ? 0.05 : 0.02),
        pulseOffset: Math.random() * Math.PI * 2,
        colorIndex: Math.floor(Math.random() * nebulaColors.length)
      });
    }

    // Animation loop
    let animationFrameId: number;
    let lastTime = Date.now();
    
    const render = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Time in seconds
      lastTime = currentTime;
      
      // Create our base gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

      if (isDarkMode) {
        // Dark mode: Deep space colors
        bgGradient.addColorStop(0, 'rgba(15, 23, 42, 1)');    // Dark slate
        bgGradient.addColorStop(1, 'rgba(2, 6, 23, 1)');      // Nearly black
      } else {
        // Light mode: Quick transition to dark space
        bgGradient.addColorStop(0, 'rgba(15, 23, 42, 1)');    // Dark slate (identical to dark mode)
        bgGradient.addColorStop(1, 'rgba(2, 6, 23, 1)');      // Nearly black (identical to dark mode)
      }
      
      // Fill with gradient
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw nebula effect with animation
      const time = Date.now() / 1000;

      nebulaPoints.forEach((point, i) => {
        // Animate radius and opacity with a subtle sine wave
        const radius = point.baseRadius * (1 + 0.1 * Math.sin(time * 0.2 + point.pulseOffset));
        const opacity = point.baseOpacity * (1 + 0.2 * Math.cos(time * 0.13 + point.pulseOffset));

        // Get the base color from our array
        const baseColor = nebulaColors[point.colorIndex];
        
        // Parse the rgba components from the baseColor string
        // This assumes baseColor is in rgba format like "rgba(r, g, b, a)"
        const colorMatch = baseColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([.\d]+)\)/);
        if (!colorMatch) return; // Skip if color parsing fails
        
        const r = parseInt(colorMatch[1], 10);
        const g = parseInt(colorMatch[2], 10);
        const b = parseInt(colorMatch[3], 10);
        
        // Adjust the final opacity based on the animation and theme
        const finalOpacity = isDarkMode ? opacity : opacity * 0.7;
        
        // Create gradient with properly formatted rgba colors
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        
        // Use rgba format for all color stops - this avoids the error
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw stars with depth effect and animation
      stars.forEach(star => {
        // Update position using depth-adjusted speed
        star.x += star.xSpeed;
        star.y += star.speed;

        // Wrap around edges
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        if (star.x > canvas.width) star.x = 0;
        if (star.x < 0) star.x = canvas.width;

        // Handle special large glyph fading animation
        if (star.type === 'glyph' && star.radius > 10 && star.fadeState) {
          // Irregular fade in/out animation for special glyphs
          if (star.fadeState === 'in') {
            star.opacity += (star.fadeRate || 0.001) * deltaTime * 60;
            if (star.opacity >= (star.maxOpacity || 0.8)) {
              star.opacity = star.maxOpacity || 0.8;
              star.fadeState = 'out';
            }
          } else {
            star.opacity -= (star.fadeRate || 0.001) * deltaTime * 60;
            if (star.opacity <= (star.minOpacity || 0.1)) {
              star.opacity = star.minOpacity || 0.1;
              star.fadeState = 'in';
              // Add some randomness to the fade rate when changing direction
              if (star.fadeRate) star.fadeRate = 0.0003 + (Math.random() * 0.0005);
            }
          }
          
          // Add secondary subtle pulsing to large glyphs for more visual interest
          if (star.pulseRate && star.pulseAmplitude) {
            const pulseEffect = star.pulseAmplitude * Math.sin(time * star.pulseRate + (star.pulseOffset || 0));
            star.opacity += pulseEffect;
            // Ensure opacity stays in valid range
            star.opacity = Math.max(0.05, Math.min(star.opacity, 1));
          }
        } else if (star.type !== 'glyph') {
          // Normal stars twinkle/pulse with slower rates for distant stars
          const pulseRate = 1 + (1 - star.depth) * 3; // Farther = slower
          const baseOpacity = Math.sin(time / pulseRate + star.x * 0.01) * 0.2 + 0.6;
          
          if (star.type !== 'dot') {
            star.opacity = Math.max(0.2, Math.min(0.9, baseOpacity));
          }
        }

        // Adjust opacity based on theme
        const finalOpacity = isDarkMode ? star.opacity : star.opacity * 0.7;

        // Draw different star types
        if (star.type === 'dot') {
          ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (star.type === 'plus') {
          const size = star.radius * 1.5;
          ctx.strokeStyle = `rgba(255, 255, 255, ${finalOpacity})`;
          ctx.lineWidth = isDarkMode ? 1 : 0.8;
          ctx.beginPath();
          ctx.moveTo(star.x - size, star.y);
          ctx.lineTo(star.x + size, star.y);
          ctx.moveTo(star.x, star.y - size);
          ctx.lineTo(star.x, star.y + size);
          ctx.stroke();
        } else if (star.type === 'glyph' && star.glyphChar && star.color) {
          // For glyphs, parse the color and apply final opacity
          let finalColor = star.color;
          if (star.color.startsWith('#')) {
            // Convert hex to rgba
            const r = parseInt(star.color.slice(1, 3), 16);
            const g = parseInt(star.color.slice(3, 5), 16);
            const b = parseInt(star.color.slice(5, 7), 16);
            finalColor = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
          }
          
          // Special handling for large glyphs to make them look more magical
          if (star.radius > 10) {
            // Add subtle glow effect for large glyphs
            const glowRadius = star.radius * 2.5;
            const glowGradient = ctx.createRadialGradient(
              star.x, star.y, 0, 
              star.x, star.y, glowRadius
            );
            
            // Parse color for glow
            let r, g, b;
            if (star.color.startsWith('#')) {
              r = parseInt(star.color.slice(1, 3), 16);
              g = parseInt(star.color.slice(3, 5), 16);
              b = parseInt(star.color.slice(5, 7), 16);
            } else {
              // Default if parsing fails
              r = 255; g = 255; b = 255;
            }
            
            // Create glow effect with color
            glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.2})`);
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw the actual glyph
            ctx.font = `${star.radius * 1.3}px 'Courier New', monospace`;
            ctx.fillStyle = finalColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(star.glyphChar, star.x, star.y);
            ctx.save();
            ctx.translate(star.x, star.y);
            ctx.scale(1, 1.5); // Slight vertical stretch
            ctx.fillText(star.glyphChar, 0, 0); // Now drawn at scaled center
            ctx.restore();
          } else {
            // Regular smaller glyphs
            ctx.font = `${star.radius}px monospace`;
            ctx.fillStyle = finalColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(star.glyphChar, star.x, star.y);
          }
        }
      });

      // Update and draw shooting stars
      shootingStars.forEach(star => {
        if (!star.active) return;
        
        // Update position
        const moveX = Math.cos(star.angle) * star.speed;
        const moveY = Math.sin(star.angle) * star.speed;
        star.x += moveX;
        star.y += moveY;
        
        // Check if the shooting star is out of bounds
        if (
          star.x < -100 || 
          star.x > canvas.width + 100 || 
          star.y < -100 || 
          star.y > canvas.height + 100
        ) {
          star.active = false;
          return;
        }
        
        // Draw the shooting star
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.angle);
        
        // Create gradient for the tail
        const gradient = ctx.createLinearGradient(0, 0, -star.tailLength, 0);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(0.6, `rgba(255, 255, 255, ${star.opacity * 0.2})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        // Draw the tail with gradient
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-star.tailLength, 0);
        ctx.lineWidth = 2;
        ctx.strokeStyle = gradient;
        ctx.stroke();
        
        // Draw the head of the shooting star
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        ctx.restore();
      });

      // Continue animation
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]); // Re-run effect when theme changes
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Canvas for stars and cosmic effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Subtle gradient overlays for seamless transitions */}
      <div 
        className={`absolute inset-0 pointer-events-none ${
          isDarkMode 
            ? 'bg-gradient-to-b from-slate-900/100 via-slate-900/60 to-transparent' 
            : 'bg-gradient-to-b from-slate-900/100 via-slate-900/60 to-transparent'
        }`} 
        style={{ 
          height: '50vh', 
          top: 0,
          opacity: isDarkMode ? 1 : 0 // Hide this in light mode since we're handling it in the parent
        }}
      ></div>
    </div>
  );
}