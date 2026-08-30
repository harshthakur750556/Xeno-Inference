import React, { useEffect, useRef } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
  life: number;
  maxLife: number;
}

export const NodularConstellationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { themeMode } = useWorkspaceStore();
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particles array
    const particles: Particle[] = [];
    const maxParticles = 65;
    const connectionDistance = 120;
    const mouseDistance = 140;

    const spawnParticle = (): Particle => {
      const edge = Math.random();
      let x = Math.random() * width;
      let y = Math.random() * height;

      // Randomly spawn near edges or random positions
      if (edge < 0.25) x = 0;
      else if (edge < 0.5) x = width;
      else if (edge < 0.75) y = 0;
      else y = height;

      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        radius: Math.random() * 1.5 + 1.2,
        alpha: 0,
        targetAlpha: Math.random() * 0.5 + 0.25,
        life: 0,
        maxLife: Math.floor(Math.random() * 600) + 300,
      };
    };

    // Initialize initial particles
    for (let i = 0; i < maxParticles; i++) {
      const p = spawnParticle();
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.alpha = Math.random() * p.targetAlpha;
      particles.push(p);
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = themeMode === "dark";
      const dotColor = isDark ? "214, 211, 209" : "120, 113, 108";
      const lineColor = isDark ? "161, 161, 170" : "168, 162, 158";

      // Periodically spawn new appearing dots
      if (particles.length < maxParticles && Math.random() < 0.08) {
        particles.push(spawnParticle());
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Fade in
        if (p.life < 60) {
          p.alpha = (p.life / 60) * p.targetAlpha;
        } else if (p.life > p.maxLife - 60) {
          // Fade out
          p.alpha = ((p.maxLife - p.life) / 60) * p.targetAlpha;
        }

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Bounce gently at boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const mdx = p.x - mouseRef.current.x;
          const mdy = p.y - mouseRef.current.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mDist < mouseDistance) {
            const force = (1 - mDist / mouseDistance) * 0.02;
            p.vx += mdx * force;
            p.vy += mdy * force;

            // Connect to mouse
            const lineAlpha = (1 - mDist / mouseDistance) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor}, ${p.alpha})`;
        ctx.fill();

        // Draw connections to near neighbors
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const connectionAlpha = (1 - dist / connectionDistance) * Math.min(p.alpha, p2.alpha) * 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${connectionAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [themeMode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-300"
    />
  );
};
