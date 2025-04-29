'use client';

import React, { useEffect, useRef } from 'react';

interface RealTimeWaveformProps {
  audioStream: MediaStream | null;
}

const RealTimeWaveform: React.FC<RealTimeWaveformProps> = ({ audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!audioStream || !canvasRef.current) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;

    if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 512;
        analyserRef.current.smoothingTimeConstant = 0.8;
    }
    const analyser = analyserRef.current;

    const bufferLength = analyser.frequencyBinCount;
    if (!dataArrayRef.current || dataArrayRef.current.length !== bufferLength) {
        dataArrayRef.current = new Uint8Array(bufferLength);
    }
    const dataArray = dataArrayRef.current;

    if (!sourceRef.current || !sourceRef.current.context) {
        if (sourceRef.current) sourceRef.current.disconnect();
        sourceRef.current = audioContext.createMediaStreamSource(audioStream);
        sourceRef.current.connect(analyser);
    }

    const draw = () => {
      if (!analyser || !ctx || !canvas || !dataArray) {
        animationFrameId.current = requestAnimationFrame(draw);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== canvas.clientWidth * dpr || canvas.height !== canvas.clientHeight * dpr) {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.scale(dpr, dpr);
      }
      const WIDTH = canvas.clientWidth;
      const HEIGHT = canvas.clientHeight;
      const centerY = HEIGHT / 2;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      const gradient = ctx.createLinearGradient(0, centerY - HEIGHT * 0.4, 0, centerY + HEIGHT * 0.4);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
      ctx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255.0) * HEIGHT * 0.9;

        ctx.fillRect(
            x,
            centerY - barHeight / 2,
            barWidth,
            barHeight
        );

        x += barWidth + 2;
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    if (audioContext.state === 'running') {
      draw();
    } else {
      audioContext.resume().then(() => {
        draw();
      }).catch(e => console.error("Error resuming AudioContext:", e));
    }

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, [audioStream]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default RealTimeWaveform;

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
} 