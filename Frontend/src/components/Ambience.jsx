import useSanctuaryStore from "../store/useSanctuaryStore";
import { isVisualRainEnabled } from "../utils/sanctuary";

const createParticles = (count, generator) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    ...generator(index),
  }));

const rainParticles = createParticles(48, (index) => ({
  left: `${(index * 47 + 3) % 100}%`,
  animationDelay: `${(index * 17 % 10) / 10}s`,
}));

const snowParticles = createParticles(32, (index) => {
  const size = 5 + (index * 7) % 10;
  return {
    size,
    left: `${(index * 37 + 5) % 100}%`,
    animationDelay: `${(index * 11) % 5}s`,
  };
});

const leafParticles = createParticles(20, (index) => ({
  left: `${(index * 53 + 9) % 100}%`,
  animationDelay: `${(index * 13) % 10}s`,
}));

const starParticles = createParticles(40, (index) => {
  const size = 2 + (index * 3) % 3;
  return {
    size,
    top: `${(index * 29 + 13) % 100}%`,
    left: `${(index * 43 + 17) % 100}%`,
    duration: `${2 + index % 3}s`,
    animationDelay: `${(index * 7) % 3}s`,
  };
});

const Ambience = () => {
  const { settings } = useSanctuaryStore();

  const selectedAmbience = Array.isArray(settings?.music) ? settings.music : [];
  const atmosphereAmbience = {
    misty: "fog",
    starry: "stars",
  }[settings?.backgroundAtmosphere];
  const activeAmbience = [...new Set(atmosphereAmbience ? [...selectedAmbience, atmosphereAmbience] : selectedAmbience)];
  const effectsEnabled = settings?.ambientEffects === true;
  const reducedMotion = settings?.reducedMotion === true;
  const intensity = settings?.particleIntensity || "medium";
  const effectCount = { off: 0, low: 0.25, medium: 0.6, high: 1 }[intensity] ?? 0.6;

  return (
    <>
      {/* Ambient Animations */}
      <style>{`
        @keyframes rain {
          0% {
            transform: translateY(-100vh);
          }

          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes snow {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }

          10% {
            opacity: 0.8;
          }

          90% {
            opacity: 0.8;
          }

          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes leaves {
          0% {
            transform: translateY(-100px) translateX(0) rotate(0deg);
            opacity: 0;
          }

          10% {
            opacity: 0.9;
          }

          90% {
            opacity: 0.9;
          }

          100% {
            transform: translateY(100vh) translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fogMove {
          0% {
            transform: translateX(-10%);
          }

          100% {
            transform: translateX(10%);
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
          }

          50% {
            opacity: 1;
          }
        }
      `}</style>

      {/* Rain Effect */}
      {isVisualRainEnabled(settings) && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {rainParticles.slice(0, Math.round(rainParticles.length * effectCount)).map((particle) => (
            <div
              key={particle.id}
              className="absolute bg-blue-300 opacity-50"
              style={{
                width: "2px",
                height: "20px",
                left: particle.left,
                animation: reducedMotion ? "none" : "rain 0.6s linear infinite",
                animationDelay: particle.animationDelay,
              }}
            />
          ))}
        </div>
      )}

      {/* Snow Effect */}
      {effectsEnabled && activeAmbience.includes("snow") && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {snowParticles.slice(0, Math.round(snowParticles.length * effectCount)).map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: particle.left,
                animation: reducedMotion ? "none" : "snow 5s linear infinite",
                animationDelay: particle.animationDelay,
              }}
            />
          ))}
        </div>
      )}

      {/* Leaves Effect */}
      {effectsEnabled && activeAmbience.includes("leaves") && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {leafParticles.slice(0, Math.round(leafParticles.length * effectCount)).map((particle) => (
            <div
              key={particle.id}
              className="absolute text-2xl"
              style={{
                left: particle.left,
                animation: reducedMotion ? "none" : "leaves 10s linear infinite",
                animationDelay: particle.animationDelay,
              }}
            >
              🍂
            </div>
          ))}
        </div>
      )}

      {/* Fog Effect */}
      {effectsEnabled && activeAmbience.includes("fog") && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-gray-400 opacity-30"
            style={{
              animation: reducedMotion ? "none" : "fogMove 20s ease-in-out infinite alternate",
            }}
          />
        </div>
      )}

      {/* Stars Effect */}
      {effectsEnabled && activeAmbience.includes("stars") && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {starParticles.slice(0, Math.round(starParticles.length * effectCount)).map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                top: particle.top,
                left: particle.left,
                animation: reducedMotion ? "none" : `twinkle ${particle.duration} ease-in-out infinite`,
                animationDelay: particle.animationDelay,
              }}
            />
          ))}
        </div>
      )}

      {/* Night Mode */}
      {effectsEnabled && activeAmbience.includes("night-mode") && (
        <div className="fixed inset-0 z-0 bg-indigo-950 opacity-30 pointer-events-none" />
      )}
    </>
  );
};

export default Ambience;
