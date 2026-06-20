import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, SlidersHorizontal, Loader2, BookOpen } from 'lucide-react';
import api from '../api/axios';
import SkillCard from '../components/skills/SkillCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import GlassCard from '../components/common/GlassCard';
import Illustration from '../components/common/Illustration';
import { toast } from 'sonner';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills');
      setSkills(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to connect to your mastery forge');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/skills', newSkill);
      toast.success('A new path has been forged!', { icon: '✨' });
      setIsAddModalOpen(false);
      setNewSkill({ name: '', category: '' });
      fetchSkills();
    } catch (error) {
      toast.error('The forge is cooling down. Please try again.');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm('Are you sure you want to release this skill path?')) {
      try {
        await api.delete(`/skills/${id}`);
        toast.success('Path released');
        fetchSkills();
      } catch (error) {
        toast.error('Failed to release path');
      }
    }
  };

  const categories = ['All', ...new Set(skills.map(s => s.category))];
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Your Mastery Paths</h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            These are the seeds of your future expertise. Nurture them with consistent rituals and watch yourself transform.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} size="lg" className="rounded-2xl shadow-xl shadow-primary-500/10">
          <Plus size={20} className="mr-2" />
          Plant a New Seed
        </Button>
      </div>

      {/* Search & Filter */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 border-white/5 bg-white/[0.02]">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-primary-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search your journey..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-5 pr-12 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-forge-950">{cat}</option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </GlassCard>

      {/* Skills Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSkills.map(skill => (
            <SkillCard 
              key={skill._id} 
              skill={skill} 
              onDelete={handleDeleteSkill}
              onEdit={() => toast.info('This path is currently being refined.')}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center relative overflow-hidden rounded-[3rem] bg-forge-900/20 border border-white/5">
          <div className="relative w-80 h-80 mb-8">
            <Illustration name="growthTree" className="w-full h-full opacity-90" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight">Your garden awaits seeds...</h3>
          <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto leading-relaxed">
            {searchTerm || categoryFilter !== 'All' 
              ? "We couldn't find any branches matching your search. Try looking in a different part of the forest." 
              : "Your mastery tree is ready to grow. Plant your first skill seed and watch it bloom into a strong branch."}
          </p>
          {!searchTerm && categoryFilter === 'All' && (
            <Button className="mt-12 rounded-2xl px-12 py-5 shadow-2xl shadow-warm-amber/20 bg-gradient-to-r from-warm-amber to-primary-400 text-lg" onClick={() => setIsAddModalOpen(true)}>
              Plant Your First Seed
            </Button>
          )}
          
          {/* Ambient Glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-warm-amber/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px]" />
        </div>
      )}

      {/* Add Skill Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-950/80 backdrop-blur-md animate-in fade-in duration-500">
          <GlassCard className="w-full max-w-md p-10 border-white/10 shadow-2xl rounded-[2.5rem]">
            <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">New Mastery Path</h2>
            <form onSubmit={handleAddSkill} className="space-y-8">
              <Input 
                label="What skill are you pursuing?" 
                placeholder="e.g. Piano, Design, Cooking" 
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                required
                className="bg-white/5 border-white/10 p-4"
              />
              <Input 
                label="Category" 
                placeholder="e.g. Art, Tech, Wellness" 
                value={newSkill.category}
                onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                required
                className="bg-white/5 border-white/10 p-4"
              />
              <div className="flex gap-4 mt-10">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1 rounded-2xl py-4"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Maybe later
                </Button>
                <Button type="submit" className="flex-1 rounded-2xl py-4 shadow-xl shadow-primary-500/20">
                  Forge Path
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Skills;
