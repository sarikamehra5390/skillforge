import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './common/GlassCard';
import useAppStore from '../store/useAppStore';

const moodOptions = [
  {
    id: 'motivated',
    label: 'Motivated',
    emoji: '😊',
    color: 'text-green-400',
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '😌',
    color: 'text-blue-400',
  },
  {
    id: 'tired',
    label: 'Tired',
    emoji: '😴',
    color: 'text-purple-400',
  },
  {
    id: 'focused',
    label: 'Ready to Focus',
    emoji: '🔥',
    color: 'text-warm-amber',
  },
];

const CheckInModal = ({ isOpen, onClose }) => {
  const { saveMood } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSaving(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  const handleMoodSelect = async (mood) => {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      await saveMood(mood);
    } catch (error) {
      console.error('Failed to save mood:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="check-in-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-forge-950/60 backdrop-blur-md"
            onClick={isSaving ? undefined : onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-lg"
          >
            <GlassCard className="p-10">
              <div className="mb-8 text-center">
                <div
                  className="mb-4 text-6xl"
                  aria-hidden="true"
                >
                  🌸
                </div>

                <h2
                  id="check-in-title"
                  className="mb-2 text-2xl font-bold italic text-white"
                >
                  Welcome back!
                </h2>

                <p className="text-slate-400">
                  How are you feeling today?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {moodOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      handleMoodSelect(option.id)
                    }
                    disabled={isSaving}
                    aria-label={`Select ${option.label} mood`}
                    className="group disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <GlassCard className="p-6 text-center transition-all hover:border-primary-500/20">
                      <div
                        className="mb-3 text-4xl transition-transform group-hover:scale-110"
                        aria-hidden="true"
                      >
                        {option.emoji}
                      </div>

                      <p
                        className={`text-sm font-bold ${option.color}`}
                      >
                        {option.label}
                      </p>
                    </GlassCard>
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckInModal;