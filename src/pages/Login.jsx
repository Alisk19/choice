import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import AppInput from '../components/ui/AppInput';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1260&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1260&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=1260&auto=format&fit=crop",
];

export default function Login() {
  const [email, setEmail] = useState('mdhasshu969@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email !== 'mdhasshu969@gmail.com') {
      toast.error('Unauthorized. Access is strictly limited to administrators.');
      return;
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Authentication Successful. Welcome.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials or network error.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-5xl flex bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-white/10 h-[600px]">
        
        {/* Left Side (Form) */}
        <div
          className="w-full lg:w-1/2 p-8 lg:p-16 relative overflow-hidden flex flex-col justify-center"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Mouse Hover Glow Effect */}
          <div
            className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-3xl transition-opacity duration-300 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          <div className="relative z-10 w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white mb-6">Sign in</h1>
              
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-6">Please enter your admin credentials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <AppInput 
                placeholder="Email Address" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <AppInput 
                placeholder="Password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              
              <div className="flex justify-center mt-8">
                 <button 
                  type="submit"
                  disabled={loading}
                  className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-xl bg-neutral-900 dark:bg-white px-8 py-3.5 text-sm font-bold text-white dark:text-neutral-900 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 cursor-pointer w-full disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </span>
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                    <div className="relative h-full w-12 bg-white/20 dark:bg-black/10" />
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Right Side (Image) */}
        <div className="hidden lg:block w-1/2 relative h-full overflow-hidden bg-neutral-950">
            {/* Dark overlay to make sure it looks sleek */}
            <div className="absolute inset-0 bg-indigo-900/20 dark:bg-black/40 z-10 mix-blend-multiply pointer-events-none"></div>
            
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentSlide}
                src={slides[currentSlide]}
                alt="Premium Smartphones"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            
            <div className="absolute bottom-10 left-10 z-20 max-w-md pointer-events-none">
              <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">Mobile Choice</h2>
              <p className="text-white/80 font-medium text-lg drop-shadow-md">Premium inventory management for flagship devices.</p>
            </div>
       </div>
       
      </div>
    </div>
  );
}
