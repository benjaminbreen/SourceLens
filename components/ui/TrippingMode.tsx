// components/connections/CosmicBackground.tsx
// Ambient cosmic background with subtle stars, shooting stars, nebula effects, and pulsating stars
'use client';

import React, { useEffect, useRef } from 'react';

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match window
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initial setup
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Create regular stars
    type Star = {
      x: number;
      y: number;
      radius: number;
      baseOpacity: number; // Base opacity to return to
      opacity: number;     // Current opacity that can change
      speed: number;
    };
    
    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3.5,
        baseOpacity: Math.random() * 0.9 + 0.1,
        opacity: Math.random() * 0.9 + 0.1,
        speed: Math.random() * 0.1 + 0.03
      });
    }
    
    // Create prominent pulsating stars (larger, with special animation)
    type PulsatingStar = {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      minRadius: number;
      baseOpacity: number;
      opacity: number;
      pulseSpeed: number;
      pulsePhase: number;
      color: string;
    };
    
    const pulsatingStars: PulsatingStar[] = [];
    const starColors = ['#FFFFFF', '#E3F2FD', '#BBDEFB', '#90CAF9', '#FFF9C4'];
    
    // Add 3-5 pulsating stars
    for (let i = 0; i < 4; i++) {
      const baseRadius = Math.random() * 5 + 6; // Larger base radius
      pulsatingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: baseRadius,
        maxRadius: baseRadius * 1.5,
        minRadius: baseRadius * 0.7,
        baseOpacity: Math.random() * 0.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        pulseSpeed: Math.random() * 0.003 + 0.001, // Very slow pulse
        pulsePhase: Math.random() * Math.PI * 2,   // Random start phase
        color: starColors[Math.floor(Math.random() * starColors.length)]
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
      inactiveStar.length = Math.random() * 80 + 50; // Tail length
      inactiveStar.speed = Math.random() * 15 + 10;  // Speed
      inactiveStar.opacity = Math.random() * 0.3 + 0.7;
      inactiveStar.active = true;
      inactiveStar.tailLength = Math.random() * 100 + 150; // Visual tail length
    };
    
    // Schedule shooting stars randomly
    const scheduleNextShootingStar = () => {
      // Random delay between 3-15 seconds
      const nextStarDelay = Math.random() * 12000 + 3000;
      setTimeout(() => {
        activateShootingStar();
        scheduleNextShootingStar(); // Schedule the next one
      }, nextStarDelay);
    };
    
    // Start the shooting star cycle
    scheduleNextShootingStar();
    
    // Create nebula points
    const nebulaPoints: { 
      x: number; 
      y: number; 
      radius: number; 
      color: string; 
      opacity: number;
      pulseAmount: number;
      pulseSpeed: number;
      phase: number;
    }[] = [];
    
    const nebulaColors = [
      'rgba(139, 92, 246, 1)',   // Purple
      'rgba(99, 102, 241, 1)',   // Indigo
      'rgba(236, 72, 153, 1)',   // Pink
      'rgba(16, 185, 129, 1)',   // Emerald
      'rgba(59, 130, 246, 1)',   // Blue
      'rgba(249, 115, 22, 1)'    // Orange
    ];
    
    for (let i = 0; i < 20; i++) {
      const baseRadius = Math.random() * 150 + 50;
      nebulaPoints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: baseRadius,
        color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
        opacity: Math.random() * 0.1 + 0.05,
        pulseAmount: Math.random() * 0.2 + 0.1, // How much to pulse
        pulseSpeed: Math.random() * 0.001 + 0.0005, // Very slow pulse
        phase: Math.random() * Math.PI * 2 // Random start phase
      });
    }
    
    // Animation loop
    let animationFrameId: number;
    let lastTimestamp = 0;
    
    const render = (timestamp: number) => {
      // Calculate delta time for smoother animations
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Clear canvas with a slight fade effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Adjust the last value for trail length
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw nebula effect with subtle pulsing
      nebulaPoints.forEach(point => {
        // Calculate pulsing effect
        const pulsingFactor = 1 + Math.sin(timestamp * point.pulseSpeed + point.phase) * point.pulseAmount;
        const currentRadius = point.radius * pulsingFactor;
        
        // Parse the rgba color to modify opacity
        const colorMatch = point.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([.\d]+)\)/);
        if (!colorMatch) return;
        
        const r = parseInt(colorMatch[1], 10);
        const g = parseInt(colorMatch[2], 10);
        const b = parseInt(colorMatch[3], 10);
        
        // Create gradient with proper rgba format
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, currentRadius
        );
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${point.opacity * pulsingFactor})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw regular stars
      stars.forEach(star => {
        // Update position
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        
        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw pulsating stars
      pulsatingStars.forEach(star => {
        // Calculate pulsing effect for size
        const timeFactor = timestamp * star.pulseSpeed;
        const sizePulse = Math.sin(timeFactor + star.pulsePhase);
        const opacityPulse = Math.sin(timeFactor * 0.7 + star.pulsePhase); // Slightly out of phase
        
        // Calculate current radius and opacity
        const currentRadius = star.minRadius + (sizePulse + 1) * 0.5 * (star.maxRadius - star.minRadius);
        const currentOpacity = star.baseOpacity * (0.7 + 0.3 * (opacityPulse + 1) * 0.5);
        
        // Draw the star
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, currentRadius * 2
        );
        
        // Parse the color
        const colorMatch = star.color.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
        if (!colorMatch) return;
        
        const color = colorMatch[0];
        // Convert hex to rgb
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentOpacity})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, currentRadius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a center glow
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, currentRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
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
        gradient.addColorStop(0.6, `rgba(255, 255, 255, ${star.opacity * 0.3})`);
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
    
    // Start the animation loop
    animationFrameId = window.requestAnimationFrame(render);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
    />
  );
}