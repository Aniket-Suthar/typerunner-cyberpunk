import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    // Load full tsparticles engine to ensure we have all features (shapes, lines, hover effects)
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab", // Connects lines from cursor to particles
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.5,
              },
            },
          },
        },
        particles: {
          color: {
            value: ["#00f0ff", "#ff00e5", "#00ffaa"],
          },
          links: {
            color: "#ffffff",
            distance: 120,
            enable: true,
            opacity: 0.1,
            width: 1,
            triangles: {
              enable: true,
              opacity: 0.05,
            },
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: true,
            speed: 0.5,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 40, // Low density to preserve game performance
          },
          opacity: {
            value: 0.8,
            random: true,
          },
          shape: {
            type: ["circle", "triangle", "polygon"],
            options: {
              polygon: { sides: 6 }
            }
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
        background: { color: "transparent" },
      }}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

export default ParticlesBackground;
