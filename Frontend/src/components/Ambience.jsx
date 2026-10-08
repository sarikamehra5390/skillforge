import useSanctuaryStore from "../store/useSanctuaryStore";

const createParticles = (count, generator) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    ...generator(),
  }));

const rainParticles = createParticles(80, () => ({
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random()}s`,
}));

const snowParticles = createParticles(40, () => {
  const size = 5 + Math.random() * 10;
  return {
    size,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
  };
});

const leafParticles = createParticles(20, () => ({
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 10}s`,
}));

const starParticles = createParticles(60, () => {
  const size = 2 + Math.random() * 3;
  return {
    size,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: `${2 + Math.random() * 3}s`,
    animationDelay: `${Math.random() * 3}s`,
  };
});

const Ambience = () => {
  const { settings } = useSanctuaryStore();

  const activeAmbience = Array.isArray(settings?.music)
    ? settings.music
    : [];

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
      {activeAmbience.includes("rain") && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {rainParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute bg-blue-300 opacity-50"
              style={{
                width: "2px",
                height: "20px",
                left: particle.left,
                animation: "rain 0.6s linear infinite",
                animationDelay: particle.animationDelay,
              }}
            />
          ))}
        </div>
      )}

      {/* Snow Effect */}
      {activeAmbience.includes("snow") && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {snowParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: particle.left,
                animation: "snow 5s linear infinite",
                animationDelay: particle.animationDelay,
              }}
            />
          ))}
        </div>
      )}

      {/* Leaves Effect */}
      {activeAmbience.includes("leaves") && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {leafParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute text-2xl"
              style={{
                left: particle.left,
                animation: "leaves 10s linear infinite",
                animationDelay: particle.animationDelay,
              }}
            >
              🍂
            </div>
          ))}
        </div>
      )}

      {/* Fog Effect */}
      {activeAmbience.includes("fog") && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-gray-400 opacity-30"
            style={{
              animation:
                "fogMove 20s ease-in-out infinite alternate",
            }}
          />
        </div>
      )}

      {/* Stars Effect */}
      {activeAmbience.includes("stars") && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {starParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                top: particle.top,
                left: particle.left,
                animation: `twinkle ${particle.duration} ease-in-out infinite`,
                animationDelay: particle.animationDelay,
              }}
            />
          ))}
        </div>
      )}

      {/* Night Mode */}
      {activeAmbience.includes("night-mode") && (
        <div className="fixed inset-0 z-0 bg-indigo-950 opacity-30 pointer-events-none" />
      )}
    </>
  );
};

export default Ambience;
