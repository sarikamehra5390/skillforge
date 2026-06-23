import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, History, Loader2, Clock, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import SessionTimeline from '../components/sessions/SessionTimeline';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import GlassCard from '../components/common/GlassCard';
import Illustration from '../components/common/Illustration';
import XPPopup from '../components/XPPopup';
import useAuthStore from '../store/useAuthStore';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({ skillId: '', duration: '', notes: '' });
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const { user, updateUser } = useAuthStore();

  const fetchData = async () => {
    try {
      const [sessionsRes, skillsRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/skills')
      ]);
      setSessions(sessionsRes.data);
      setSkills(skillsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to read your journal');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogSession = async (e) => {
    e.preventDefault();
    if (!newSession.skillId) return toast.error('Which path did you walk today?');
    
    try {
      const response = await api.post('/sessions', {
        ...newSession,
        duration: Number(newSession.duration)
      });
      
      toast.success(`A beautiful ritual. +${response.data.xpGained} XP`, { icon: '🌱' });
      
      // Update user in store
      updateUser({
        xp: response.data.session.xpGained + (user?.xp || 0),
        level: response.data.newLevel,
        streak: response.data.newStreak
      });

      // Show XP Popup
      setXpGained(response.data.xpGained);
      setShowXPPopup(true);

      if (response.data.levelUp) {
        toast.success(`You have evolved! Level ${response.data.newLevel}`, {
          icon: '🦋',
          duration: 6000
        });
      }

      // Check for new achievements
      if (response.data.newUnlockedAchievements) {
        response.data.newUnlockedAchievements.forEach(achievement => {
          toast.success(`Achievement Unlocked: ${achievement.title}!`, {
            icon: '🏆',
            duration: 5000
          });
        });
      }
      
      setIsLogModalOpen(false);
      setNewSession({ skillId: '', duration: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error('The journal is full. Try again in a moment.');
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.notes && session.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">The Ritual Journal</h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Every moment of focus is a brick in the foundation of your mastery. Look back with pride at the time you've dedicated to your growth.
          </p>
        </div>
        <Button onClick={() => setIsLogModalOpen(true)} size="lg" className="rounded-2xl shadow-xl shadow-primary-500/10">
          <Plus size={20} className="mr-2" />
          Log a Moment
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="p-8 flex items-center gap-8 group bg-white/[0.02] border-white/5">
          <div className="w-16 h-16 bg-primary-500/10 rounded-[1.5rem] flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform duration-500">
            <History size={28} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Rituals</p>
            <p className="text-3xl font-bold text-white tracking-tighter">{sessions.length}</p>
          </div>
        </GlassCard>
        <GlassCard className="p-8 flex items-center gap-8 group bg-white/[0.02] border-white/5">
          <div className="w-16 h-16 bg-secondary-500/10 rounded-[1.5rem] flex items-center justify-center text-secondary-400 group-hover:scale-110 transition-transform duration-500">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Time Lived</p>
            <p className="text-3xl font-bold text-white tracking-tighter">
              {sessions.reduce((acc, s) => acc + s.duration, 0)}<span className="text-sm ml-1 text-slate-500 uppercase not-italic">m</span>
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-8 flex items-center gap-8 group bg-white/[0.02] border-white/5">
          <div className="w-16 h-16 bg-warm-amber/10 rounded-[1.5rem] flex items-center justify-center text-warm-amber group-hover:scale-110 transition-transform duration-500">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Active Days</p>
            <p className="text-3xl font-bold text-white tracking-tighter">
              {new Set(sessions.map(s => new Date(s.completedAt).toDateString())).size}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Search & Filter */}
      <GlassCard className="p-4 bg-white/[0.01] border-white/5">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-primary-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search your memories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all"
          />
        </div>
      </GlassCard>

      {/* Timeline */}
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filteredSessions.length > 0 ? (
          <SessionTimeline sessions={filteredSessions} />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center relative overflow-hidden rounded-[3rem] bg-forge-900/20 border border-white/5">
            <div className="relative w-80 h-80 mb-8">
              <Illustration name="studySanctuary" className="w-full h-full opacity-90" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight">Your growth journal is empty...</h3>
            <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto leading-relaxed">
              {searchTerm 
                ? "No watering moments match that search. Try looking for something else." 
                : "Every practice session waters your tree. Record your first watering and watch your mastery grow."}
            </p>
            {!searchTerm && (
              <Button className="mt-12 rounded-2xl px-12 py-5 shadow-2xl shadow-warm-amber/20 bg-gradient-to-r from-warm-amber to-primary-400 text-lg" onClick={() => setIsLogModalOpen(true)}>
                Water Your Tree
              </Button>
            )}
            
            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-warm-amber/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px]" />
          </div>
        )}
      </div>

      {/* Log Session Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-950/80 backdrop-blur-md animate-in fade-in duration-500">
          <GlassCard className="w-full max-w-md p-10 border-white/10 shadow-2xl rounded-[2.5rem]">
            <h2 className="text-3xl font-bold text-white mb-8 tracking-tight italic">Record a Ritual</h2>
            <form onSubmit={handleLogSession} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mastery Path</label>
                <select 
                  value={newSession.skillId}
                  onChange={(e) => setNewSession({...newSession, skillId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-forge-950">Which path?</option>
                  {skills.map(skill => (
                    <option key={skill._id} value={skill._id} className="bg-forge-950">{skill.name}</option>
                  ))}
                </select>
              </div>
              <Input 
                label="Time Dedicated (min)" 
                type="number"
                placeholder="60" 
                value={newSession.duration}
                onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                required
                className="bg-white/5 border-white/10 p-4"
              />
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Reflections</label>
                <textarea 
                  placeholder="What did you feel? What did you discover?" 
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all min-h-[120px] resize-none"
                />
              </div>
              <div className="flex gap-4 mt-10">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1 rounded-2xl py-4"
                  onClick={() => setIsLogModalOpen(false)}
                >
                  Close Journal
                </Button>
                <Button type="submit" className="flex-1 rounded-2xl py-4 shadow-xl shadow-primary-500/20">
                  Record Moment
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      <AnimatePresence>
        {showXPPopup && (
          <XPPopup
            xp={xpGained}
            onComplete={() => setShowXPPopup(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sessions;
