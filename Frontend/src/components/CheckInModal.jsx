import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './common/GlassCard';
import useAppStore from '../store/useAppStore';

const moodOptions = [
  { id: 'motivated', label: 'Motivated', emoji: '😊', color: 'text-green-400' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: 'text-blue-400' },
  { id: 'tired', label: 'Tired', emoji: '😴', color: 'text-purple-400' },
  { id: 'focused', label: 'Ready to Focus', emoji: '🔥', color: 'text-warm-amber' }
];

const CheckInModal = ({ isOpen, onClose }) => {
  const { saveMood } = useAppStore();

  const handleMoodSelect = async (mood) => {
    await saveMood(mood);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-forge-950/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-lg"
          >
            <GlassCard className="p-10">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🌸</div>
                <h2 className="text-2xl font-bold text-white italic mb-2">Welcome back!</h2>
                <p className="text-slate-400">How are you feeling today?</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {moodOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleMoodSelect(option.id)}
                    className="group"
                  >
                    <GlassCard className="p-6 text-center hover:border-primary-500/20 transition-all">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                        {option.emoji}
                      </div>
                      <p className={`font-bold text-sm ${option.color}`}>
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
