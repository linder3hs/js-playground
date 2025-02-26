"use client";

import { useEffect, useRef } from "react";

// Define particle data structure
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

// Define structure for particle elements
interface ParticleElement {
  element: SVGCircleElement;
  data: Particle;
}

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect if we're on a mobile device to limit particles
    const isMobile = window.innerWidth <= 768;

    // Create particles
    const particleCount = isMobile ? 20 : 50;
    const particles: Particle[] = Array.from({ length: particleCount }).map(
      () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      })
    );

    const container = containerRef.current;
    if (!container) return;

    // Clear any existing particles
    container.innerHTML = "";

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    container.appendChild(svg);

    // Create particle elements
    const particleElements: ParticleElement[] = particles.map((particle) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", `${particle.x}%`);
      circle.setAttribute("cy", `${particle.y}%`);
      circle.setAttribute("r", `${particle.size}`);
      circle.setAttribute("fill", "currentColor");
      circle.style.color = "rgba(255, 255, 255, 0.3)";
      circle.style.opacity = particle.opacity.toString();
      svg.appendChild(circle);
      return { element: circle, data: particle };
    });

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      particleElements.forEach(({ element, data }) => {
        // Update position
        data.x += data.speedX;
        data.y += data.speedY;

        // Bounce off edges
        if (data.x < 0 || data.x > 100) data.speedX *= -1;
        if (data.y < 0 || data.y > 100) data.speedY *= -1;

        // Update element
        element.setAttribute("cx", `${data.x}%`);
        element.setAttribute("cy", `${data.y}%`);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 opacity-50 dark:opacity-20 overflow-hidden pointer-events-none"
    />
  );
}
