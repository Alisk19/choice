import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function Header() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <header className="h-20 bg-neutral-950/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 z-20 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex items-center gap-2 max-w-md w-full relative">
          <Search className="w-5 h-5 absolute left-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search inventory, sales, customers..." 
            className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all text-white placeholder:text-neutral-500 hover:border-white/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-neutral-900"></span>
        </button>
        
        <div className="h-8 w-px bg-white/10 mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-transparent hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">AU</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-white leading-none mb-1">Admin User</p>
              <p className="text-xs font-semibold text-neutral-400 leading-none">mdhasshu...</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="p-2.5 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all ml-2"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
