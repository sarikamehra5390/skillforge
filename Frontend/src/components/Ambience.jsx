import React from "react";
import useSanctuaryStore from "../store/useSanctuaryStore";

const Ambience = () => {
  const { settings } = useSanctuaryStore();
  const activeAmbience = settings?.music || [];

  return (
    <>
      {/* Rain Effect */}
      {activeAmbience.includes("rain") && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-blue-300 opacity-50"
              style={{
                width: "2px",
                height: "20px",
                left: `${Math.random() * 100}%`,
                animation: `rain 0.6s linear infinite`,
                animationDelay: `${Math.random() * 1}s`,
              }}
            />
          ))}
          <style>{`
            @keyframes rain {
              0% { transform: translateY(-100vh); }
              100% { transform: translateY(100vh); }
            }
          `}</style>
        </div>
      )}

      {/* Snow Effect */}
      {activeAmbience.includes("snow") && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: `${5 + Math.random() * 10}px`,
                height: `${5 + Math.random() * 10}px`,
                left: `${Math.random() * 100}%`,
                animation: `snow 5s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
          <style>{`
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
          `}</style>
        </div>
      )}

      {/* Leaves Effect */}
      {activeAmbience.includes("leaves") && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `leaves 10s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            >
              🍂
            </div>
          ))}
          <style>{`
            @keyframes leaves {
              0% {
                transform: translateY(-100px) translateX(0) rotate(0deg);
                opacity: 0;
              }
              10% { opacity: 0.9; }
              90% { opacity: 0.9; }
              100% {
                transform: translateY(100vh) translateX(50px) rotate(360deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

      {/* Fog Effect */}
      {activeAmbience.includes("fog") && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 bg-gray-400 opacity-30"
            style={{
              animation: `fogMove 20s ease-in-out infinite alternate`,
            }}
          />
          <style>{`
            @keyframes fogMove {
              0% { transform: translateX(-10%); }
              100% { transform: translateX(10%); }
            }
          `}</style>
        </div>
      )}

      {/* Stars Effect */}
      {activeAmbience.includes("stars") && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
          <style>{`
            @keyframes twinkle {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Night Mode */}
      {activeAmbience.includes("night-mode") && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-indigo-950 opacity-30" />
      )}
    </>
  );
};

export default Ambience;
