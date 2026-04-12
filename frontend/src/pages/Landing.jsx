import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Shield, Zap, Globe, ArrowRight, Sun, Moon, Menu, X } from 'lucide-react';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('nexus-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: 'Real-Time Tracking',
      description: 'Continuously ping your URLs and catch outages the second they happen.'
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: 'Zero Hibernation',
      description: 'Keep your free-tier servers awake on platforms like Render or Vercel automatically.'
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: 'Global Analytics',
      description: 'View interactive, historical uptime data and latency trends on dynamic charts.'
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: 'Secure & Self-Hosted',
      description: 'Take control of your infrastructure without relying on costly third-party services.'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#000000] dark:text-white flex flex-col font-sans relative selection:bg-emerald-500/20 dark:selection:bg-emerald-500/30 transition-colors duration-300">
      {/* Background Effects — clipped to prevent horizontal overflow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/15 dark:bg-emerald-400/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-opacity duration-300" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-teal-300/15 dark:bg-teal-600/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-opacity duration-300" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTg0LDE5NywyMTIsMC4xKSIvPgo8L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz4KPC9zdmc+')] opacity-70 dark:opacity-50" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 transition-colors duration-300">
        <nav className="w-full px-6 sm:px-8 py-5 flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
              <Activity className="w-5 h-5 text-emerald-950" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold tracking-wide text-zinc-900 dark:text-white transition-colors duration-300">Nexus Monitor</span>
          </Link>

          {/* Desktop nav items */}
          <div className="hidden md:flex gap-6 items-center">
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 bg-white/50 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:border-zinc-700 transition-colors"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors duration-200 px-1">
              Log in
            </Link>
            <Link to="/register" className="relative group px-5 py-2 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-sm shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-0.5 dark:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="relative z-10 flex items-center gap-1.5">
                Get Started
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-4">
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 bg-white/50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 bg-white/50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen
                ? <X className="w-4 h-4" />
                : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="md:hidden border-t border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-black/80 backdrop-blur-xl"
          >
            <div className="flex flex-col px-4 py-4 gap-3 max-w-7xl mx-auto">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 px-4 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-20 lg:py-32 max-w-7xl mx-auto w-full">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-emerald-400"></span>
            </span>
            System Online
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
            Next-Gen Uptime <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">Monitoring Nexus</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto transition-colors duration-300">
            The ultimate full-stack monitoring core. Track website uptime, prevent server hibernation, and visualize real-time analytics with zero downtime.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 group hover:scale-105">
              Deploy Your Instance
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-white font-semibold text-lg transition-all duration-300 shadow-sm flex items-center justify-center">
              Access Dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-24 w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-colors duration-300 group shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">{feature.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-zinc-200 dark:border-white/5 text-center mt-auto transition-colors duration-300">
        <p className="text-zinc-500 dark:text-zinc-500 text-sm font-medium">
          Developed with ⚡ for maximum uptime.
        </p>
      </footer>
    </div>
  );
}
