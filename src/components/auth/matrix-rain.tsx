"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "0123456789ABCDEF#%&*+-=<>/\\";
const FONT_SIZE = 18;
const HEAD_COLOR = "rgba(209, 250, 229, 0.95)";
const BODY_COLOR = "rgba(16, 185, 129, 0.55)";
const FADE = "rgba(5, 6, 10, 0.09)";

export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let columns = 0;
    let heads: number[] = [];
    let speeds: number[] = [];

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      columns = Math.max(1, Math.floor(width / FONT_SIZE));
      heads = Array.from({ length: columns }, () => Math.random() * -height);
      speeds = Array.from({ length: columns }, () => 2 + Math.random() * 4);

      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, width, height);
    };

    const drawColumn = (index: number) => {
      const x = index * FONT_SIZE + FONT_SIZE / 2;
      const y = heads[index];

      if (y > 0 && y < height) {
        ctx.fillStyle = HEAD_COLOR;
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y);
      }
      if (y - FONT_SIZE * 2 > 0 && y - FONT_SIZE * 2 < height) {
        ctx.fillStyle = BODY_COLOR;
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y - FONT_SIZE * 2);
      }
    };

    setup();
    ctx.font = `${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textBaseline = "middle";

    if (reduceMotion) {
      for (let i = 0; i < columns; i++) {
        heads[i] = Math.random() * height;
        drawColumn(i);
      }
      const observer = new ResizeObserver(() => {
        setup();
        ctx.font = `${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.textBaseline = "middle";
        for (let i = 0; i < columns; i++) {
          heads[i] = Math.random() * height;
          drawColumn(i);
        }
      });
      observer.observe(canvas);
      return () => observer.disconnect();
    }

    let raf = 0;
    let last = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < 48) return;
      last = time;

      ctx.fillStyle = FADE;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < columns; i++) {
        drawColumn(i);
        heads[i] += speeds[i];
        if (heads[i] > height + Math.random() * 200) {
          heads[i] = Math.random() * -200;
          speeds[i] = 2 + Math.random() * 4;
        }
      }
    };
    raf = requestAnimationFrame(loop);

    const observer = new ResizeObserver(() => {
      setup();
      ctx.font = `${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "middle";
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
