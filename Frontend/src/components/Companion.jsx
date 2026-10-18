import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useSanctuaryStore from "../store/useSanctuaryStore";
import { COMPANION_OPTIONS } from "../utils/sanctuary";

const Companion = () => {
  const { settings } = useSanctuaryStore();
  const reducedMotion = settings?.reducedMotion === true;

  const [isBlinking, setIsBlinking] = useState(false);
  const [position, setPosition] = useState(-10);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left

  const companionData = COMPANION_OPTIONS.find(
    (companion) => companion.id === settings?.companion
  );

  // Blink animation
  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    let blinkTimer;
    let blinkEndTimer;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000;

      blinkTimer = setTimeout(() => {
        setIsBlinking(true);

        blinkEndTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 200);
      }, delay);
    };

    scheduleBlink();

    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(blinkEndTimer);
    };
  }, [reducedMotion]);

  // Walking animation
  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    const walkInterval = setInterval(() => {
      setPosition((prevX) => {
        let newX = prevX + direction * 5;

        if (newX > 190) {
          newX = 190;
          setDirection(-1);
        } else if (newX < -190) {
          newX = -190;
          setDirection(1);
        }

        return newX;
      });
    }, 100);

    return () => clearInterval(walkInterval);
  }, [direction, reducedMotion]);

  if (!companionData) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-10 left-1/2 z-40 -translate-x-1/2 text-6xl"
      style={{ x: position }}
      animate={reducedMotion ? { y: 0, rotate: 0, scale: 1 } : {
        y: [0, -5, 0],
        rotate: [0, 2, 0, -2, 0],
        scale: !reducedMotion && isBlinking ? 0.95 : 1,
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
        scale: {
          duration: 0.1,
        },
      }}
      aria-label={`${companionData.name || "Companion"}`}
      role="img"
    >
      <span
        style={{
          transform:
            direction === -1 ? "scaleX(-1)" : "none",
          display: "inline-block",
        }}
      >
        {companionData.emoji}
      </span>
    </motion.div>
  );
};

export default Companion;
