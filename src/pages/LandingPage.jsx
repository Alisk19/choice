import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Wallet } from 'lucide-react';
import { BeamsBackground } from '../components/ui/beams-background';

const AnimatedPhone = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      className="relative w-[300px] h-[600px] md:w-[320px] md:h-[640px] perspective-[1000px]"
    >
      {/* Phone Body */}
      <div className="absolute inset-0 bg-neutral-900 rounded-[3rem] p-3 shadow-2xl border-[4px] border-neutral-800 flex flex-col overflow-hidden ring-4 ring-neutral-950 shadow-cyan-500/20 transform-style-3d group hover:rotate-y-[-10deg] transition-transform duration-700 ease-out">

        {/* Dynamic Island Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-between px-2">
          <div className="w-3 h-3 rounded-full bg-neutral-800/80"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/80 blur-[1px]"></div>
        </div>

        {/* Screen */}
        <div className="flex-1 bg-black rounded-[2.5rem] overflow-hidden relative border border-white/5 flex flex-col">
          {/* Background Wallpaper */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-cyan-950 opacity-80"></div>

          {/* Mock UI Content inside Phone */}
          <div className="relative z-10 w-full h-full p-5 pt-14 flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center text-white mb-2">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
              </div>
            </div>

            {/* Total Balance Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full h-32 rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-5 flex flex-col justify-between shadow-lg"
            >
              <div className="text-white/80 text-xs font-semibold uppercase tracking-wider">Total Revenue</div>
              <div className="text-3xl font-bold text-white tracking-tight">₹4,25,000</div>
              <div className="flex justify-between items-center text-white/90 text-xs font-medium">
                <span>+12.5% this month</span>
                <Activity className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col gap-2 items-center text-center justify-center"
              >
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-full">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-white text-xs font-semibold">Secure POS</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/10 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col gap-2 items-center text-center justify-center"
              >
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-full">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-white text-xs font-semibold">Transactions</div>
              </motion.div>
            </div>

            {/* Recent Sales List */}
            <div className="flex-1 mt-2 space-y-3">
              <div className="text-white/60 text-xs font-semibold mb-2">Recent Sales</div>
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  className="w-full h-12 bg-white/5 rounded-xl border border-white/5 flex items-center px-3 gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white/20 rounded-sm"></div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-16 bg-white/30 rounded-full"></div>
                    <div className="h-1.5 w-10 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="h-2 w-12 bg-emerald-400/50 rounded-full"></div>
                </motion.div>
              ))}
            </div>

          </div>

          {/* Glare effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
        </div>

      </div>

      {/* Glow Behind Phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-500/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>
    </motion.div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <BeamsBackground className="min-h-screen flex items-center justify-center overflow-hidden bg-black selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 h-full min-h-[80vh]">

          {/* Left Text Content */}
          <div className="flex-1 flex flex-col justify-center items-start pt-20 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-neutral-300">The Ultimate Mobile POS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-6xl lg:text-8xl font-extrabold tracking-tighter text-white mb-6 leading-[1.1]"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 animate-gradient-x">
                Mobile Choice
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-lg lg:text-xl text-neutral-400 max-w-xl mb-10 font-medium leading-relaxed"
            >
              Experience the next generation of point-of-sale systems. Track inventory, process sales, and analyze profits with absolute precision.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              <button
                onClick={() => navigate('/login')}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-extrabold text-lg transition-all hover:scale-105 hover:bg-neutral-200 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Right Mobile Phone Graphic */}
          <div className="flex-1 w-full flex items-center justify-center mt-10 lg:mt-0 relative">
            <AnimatedPhone />
          </div>

        </div>
      </div>
    </BeamsBackground>
  );
}
