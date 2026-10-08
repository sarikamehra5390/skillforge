import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search as SearchIcon, Leaf } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-lg">
        <div className="relative mx-auto w-48 h-48">
          <div className="absolute inset-0 bg-warm-amber/10 rounded-full blur-3xl animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full text-9xl animate-soft-float">
            🍃
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-warm-amber via-primary-400 to-warm-amber italic">
            404
          </h1>
          <h2 className="text-3xl font-bold text-white italic tracking-tight">
            This path has wandered off the trail.
          </h2>
          <p className="text-slate-400 leading-relaxed">
            The forest can be mysterious. Let this little leaf guide you back to where the trees are growing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-warm-amber to-primary-400 text-white font-bold shadow-xl shadow-warm-amber/20 hover:shadow-warm-amber/30 transition-all"
          >
            <Home size={18} />
            Return to Sanctuary
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
          >
            <SearchIcon size={18} />
            Find Friends
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 pt-8 text-slate-600 text-xs font-black uppercase tracking-[0.3em]">
          <Leaf size={14} className="text-warm-amber" />
          SkillForge — Lost But Never Alone
          <Leaf size={14} className="text-warm-amber" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
