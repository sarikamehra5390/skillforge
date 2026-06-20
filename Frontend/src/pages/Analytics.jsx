import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Calendar,
  ChevronDown,
  Filter
} from 'lucide-react';
import api from '../api/axios';
import GlassCard from '../components/common/GlassCard';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, skillsRes] = await Promise.all([
          api.get('/sessions'),
          api.get('/skills')
        ]);

        const sessions = sessionsRes.data;
        const skills = skillsRes.data;

        // Process data for charts
        // 1. Weekly Trends (last 7 days)
        const weeklyData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
          const daySessions = sessions.filter(s => 
            new Date(s.completedAt).toDateString() === date.toDateString()
          );
          return {
            name: dateStr,
            minutes: daySessions.reduce((acc, s) => acc + s.duration, 0),
            xp: daySessions.reduce((acc, s) => acc + s.xpGained, 0)
          };
        });

        // 2. Skill Distribution
        const skillDist = skills.map(skill => ({
          name: skill.name,
          value: sessions.filter(s => s.skillId === skill._id).reduce((acc, s) => acc + s.duration, 0)
        })).filter(s => s.value > 0);

        setData({ weeklyData, skillDist, totalSessions: sessions.length, totalSkills: skills.length });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-[400px] rounded-2xl" />
          <LoadingSkeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white italic">Growth Insights</h1>
          <p className="text-slate-400 font-medium mt-1">Visualize your tree's growth and nurture it better</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all">
            <Calendar size={16} className="text-primary-400" />
            Last 7 Days
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <GlassCard className="p-8 border-t-2 border-t-primary-400 group">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Growth Index</p>
          <div className="flex items-end gap-3 mt-4">
            <p className="text-4xl font-black text-white italic tracking-tighter">84</p>
            <Badge variant="success" className="mb-2 px-2 py-0.5 rounded-md">+5%</Badge>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-primary-400 w-[84%] group-hover:w-[86%] transition-all duration-1000 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
          </div>
        </GlassCard>
        <GlassCard className="p-8 border-t-2 border-t-secondary-400">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Cycle Average</p>
          <div className="flex items-baseline gap-2 mt-4">
            <p className="text-4xl font-black text-white italic tracking-tighter">
              {data.totalSessions ? Math.round(data.weeklyData.reduce((acc, d) => acc + d.minutes, 0) / data.totalSessions) : 0}
            </p>
            <span className="text-sm font-black text-slate-500 uppercase italic">min</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-6 font-bold uppercase tracking-widest">Optimal: 45-60m</p>
        </GlassCard>
        <GlassCard className="p-8 border-t-2 border-t-warm-amber">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Growth Goal</p>
          <div className="mt-4">
            <div className="flex justify-between items-end mb-2">
              <p className="text-sm font-black text-white italic uppercase tracking-tighter">1,250 <span className="text-[10px] text-slate-500 not-italic">/ 2,000 XP</span></p>
              <span className="text-xs font-black text-warm-amber">62%</span>
            </div>
            <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-warm-amber w-[62%] shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-8 border-t-2 border-t-emerald-400">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Peak Day</p>
          <p className="text-3xl font-black text-white italic tracking-tighter mt-4 uppercase">Wednesday</p>
          <p className="text-[10px] text-slate-500 mt-6 font-bold uppercase tracking-widest italic">Most growth detected</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Practice Trends */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 italic">
              <TrendingUp size={20} className="text-primary-500" />
              Telemetry
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] animate-pulse" />
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Runtime Load</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyData}>
                <defs>
                  <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip 
                  cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#8B5CF6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorMin)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Skill Distribution */}
        <GlassCard className="p-8">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3 italic">
            <Clock size={20} className="text-secondary-500" />
            Core Allocation
          </h3>
          <div className="h-[350px] w-full flex items-center justify-center relative">
             {/* Center Label for Pie Chart */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-white italic tracking-tighter">100%</span>
             </div>
            {data.skillDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.skillDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {data.skillDist.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="rgba(0,0,0,0)"
                        className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '900',
                      textTransform: 'uppercase'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-600 font-black uppercase text-xs tracking-widest italic">Insufficient telemetry data</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6">
            {data.skillDist.slice(0, 4).map((skill, i) => (
              <div key={skill.name} className="flex items-center gap-3 group">
                <div className="w-2.5 h-2.5 rounded-sm shadow-lg" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate group-hover:text-slate-300 transition-colors">{skill.name}</span>
                <span className="text-xs text-white font-black italic ml-auto">{skill.value}m</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Analytics;
