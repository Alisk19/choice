import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children }) {
  const { user, setUser, authInitialized, setAuthInitialized } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Strictly enforce the specific email requirement
      if (currentUser && currentUser.email === 'mdhasshu969@gmail.com') {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, [setUser, setAuthInitialized]);

  if (!authInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 to-pink-50 opacity-50"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 relative z-10"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 relative z-10" />
          </div>
          <p className="text-lg font-bold text-slate-700 tracking-wide">Authenticating Session...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
