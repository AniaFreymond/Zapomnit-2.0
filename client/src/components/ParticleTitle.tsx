import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  decreasing: boolean;
};

type ParticleTitleProps = {
  text: string;
  className?: string;
};

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#6366f1']; // Blue, Purple, Pink, Indigo

export default function ParticleTitle({ text, className = '' }: ParticleTitleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Set up canvas and particles
  useEffect(() => {
    // Get canvas
    const canvas = canvasRef.current;
    const textElement = textRef.current;
    if (!canvas || !textElement) return;

    // Get canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match the text element size
    const resizeCanvas = () => {
      const rect = textElement.getBoundingClientRect();
      canvas.width = rect.width + 40; // Add some padding
      canvas.height = rect.height + 40;
    };

    // Call resize once, then on window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate particles
    const createParticles = () => {
      particlesRef.current = [];
      const particleCount = 25;

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 0.5,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: Math.random() * 0.6 + 0.1,
          decreasing: Math.random() > 0.5
        });
      }
    };

    createParticles();

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update particle position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Update alpha based on direction
        if (particle.decreasing) {
          particle.alpha -= 0.005;
          if (particle.alpha <= 0.1) {
            particle.decreasing = false;
          }
        } else {
          particle.alpha += 0.005;
          if (particle.alpha >= 0.7) {
            particle.decreasing = true;
          }
        }

        // Draw particle
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Boundary checking - keep particles strictly inside
        const padding = 10;
        if (particle.x < padding) {
          particle.x = padding;
          particle.speedX = Math.abs(particle.speedX);
        }
        if (particle.x > canvas.width - padding) {
          particle.x = canvas.width - padding;
          particle.speedX = -Math.abs(particle.speedX);
        }
        if (particle.y < padding) {
          particle.y = padding;
          particle.speedY = Math.abs(particle.speedY);
        }
        if (particle.y > canvas.height - padding) {
          particle.y = canvas.height - padding;
          particle.speedY = -Math.abs(particle.speedY);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDarkMode]);

  return (
    <div className="relative inline-block">
      <canvas 
        ref={canvasRef} 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
      />
      <div 
        ref={textRef} 
        className={`relative z-10 ${className}`} 
        aria-label={text}
      >
        {text}
      </div>
    </div>
  );
}
