'use client';

import { useEffect, useRef } from 'react';

export default function WaveformVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>(0);
  const barsRef = useRef<number[]>([]);
  const timeRef = useRef<number>(0);
  const trendRef = useRef(0.15);
  const speakingRef = useRef(false);
  const speakingTimerRef = useRef(0);
  const transitionRef = useRef(false);
  const transitionProgressRef = useRef(0);
  
  // Initialize bars
  useEffect(() => {
    const barCount = 40;
    const initialBars = Array(barCount).fill(0).map(() => 0.15);
    barsRef.current = initialBars;
  }, []);

  const animate = (timestamp: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const deltaTime = Math.min(timestamp - (timeRef.current || timestamp), 50);
    timeRef.current = timestamp;
    
    const slowFactor = 0.25;
    const adjustedDelta = deltaTime * slowFactor;
    
    speakingTimerRef.current += adjustedDelta;
    
    if (transitionRef.current) {
      transitionProgressRef.current += 0.0005 * adjustedDelta;
      
      if (transitionProgressRef.current >= 1) {
        transitionRef.current = false;
        transitionProgressRef.current = 0;
      }
    } else {
      const currentDuration = speakingRef.current ? 3000 : 1500;
      
      if (speakingTimerRef.current > currentDuration) {
        speakingRef.current = !speakingRef.current;
        speakingTimerRef.current = 0;
        transitionRef.current = true;
        transitionProgressRef.current = 0;
        
        if (speakingRef.current) {
          trendRef.current = 0.15 + Math.random() * 0.3;
        } else {
          trendRef.current = 0.05 + Math.random() * 0.1;
        }
      }
    }
    
    const trendTarget = trendRef.current;
    
    let prevBar = barsRef.current[0];
    
    barsRef.current = barsRef.current.map((bar, index) => {
      const trendInfluence = (trendTarget - bar) * 0.003 * adjustedDelta;
      
      const randomAmount = speakingRef.current ? 0.15 : 0.05;
      const randomFactor = (Math.random() * randomAmount - randomAmount/2) * (adjustedDelta / 20);
      
      const coherence = index > 0 ? (prevBar - bar) * 0.12 : 0;
      
      let jumpFactor = 0;
      if (Math.random() > 0.9) {
        jumpFactor = (Math.random() - 0.5) * 0.18;
      }
      
      let newHeight = bar + trendInfluence + randomFactor + coherence + jumpFactor;
      
      if (speakingRef.current && !transitionRef.current) {
        if (Math.random() > 0.96) {
          newHeight += Math.random() * 0.4;
        } else if (Math.random() < 0.04) {
          newHeight -= Math.random() * 0.2;
        }
      }
      
      // Keep within bounds - lower maximum for more natural speech
      const minValue = 0.02;
      const maxValue = speakingRef.current ? 0.8 : 0.25;
      
      // During transition, interpolate between min/max values
      const effectiveMin = minValue;
      let effectiveMax = maxValue;
      
      if (transitionRef.current) {
        const progress = transitionProgressRef.current;
        if (speakingRef.current) {
          // Transitioning to speaking - gradually increase max
          effectiveMax = 0.25 + progress * (0.8 - 0.25);
        } else {
          // Transitioning to silence - gradually decrease max
          effectiveMax = 0.8 - progress * (0.8 - 0.25);
        }
      }
      
      newHeight = Math.max(effectiveMin, Math.min(effectiveMax, newHeight));
      
      prevBar = newHeight;
      
      return newHeight;
    });
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerY = height / 2;
    const bars = barsRef.current;
    const barWidth = 4;
    const barSpacing = width / bars.length;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#051934');
    gradient.addColorStop(1, '#98b7b3');
    
    ctx.fillStyle = gradient;
    
    bars.forEach((bar, index) => {
      const x = index * barSpacing;
      const barHeight = bar * height * 0.8;
      
      ctx.fillRect(
        x - barWidth/2, 
        centerY - barHeight/2, 
        barWidth, 
        barHeight
      );
    });
    
    requestIdRef.current = requestAnimationFrame(animate);
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
} 