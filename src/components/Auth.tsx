import { useState, FormEvent } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Facebook authentication is not enabled on this Firebase project yet. Please enable it in your Firebase console under Auth > Sign-in Method.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled yet. Please contact the administrator or use Google Sign-in.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-sm mx-auto p-10 border border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl font-light uppercase tracking-tighter leading-none">
          {isLogin ? 'Access Studio' : 'Create Profile'}
        </h2>
        <div className="h-[1px] w-8 bg-black" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-studio-gray font-bold">
          {isLogin ? 'Sheet 00 / Login' : 'Sheet 00 / Registration'}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-3 border border-black p-3.5 bg-white text-black hover:bg-neutral-50 active:scale-[0.99] transition-all text-[10px] uppercase tracking-widest font-black group disabled:opacity-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.78 0 3.37.61 4.62 1.8l3.43-3.43C17.96 1.15 15.15 0 12 0 7.31 0 3.25 2.7 1.25 6.63l3.96 3.07C6.18 6.73 8.87 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.43 3.58l3.78 2.92c2.2-2.03 3.68-5.02 3.68-8.65z"
              />
              <path
                fill="#FBBC05"
                d="M5.21 14.81c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31L1.25 7.12C.45 8.73 0 10.51 0 12.39s.45 3.66 1.25 5.27l3.96-3.07C4.83 13.9 4.83 14.1 5.21 14.81z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.78-2.92c-1.12.75-2.54 1.21-4.17 1.21-3.13 0-5.82-1.69-6.79-4.66l-3.96 3.07C3.25 21.3 7.32 24 12 24z"
              />
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={handleFacebookSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-3 border border-black p-3.5 bg-[#1877F2] text-white hover:bg-[#166FE5] active:scale-[0.99] transition-all text-[10px] uppercase tracking-widest font-black group disabled:opacity-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <svg className="w-4 h-4 fill-white shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-[0.5px] bg-studio-border flex-1" />
          <span className="text-[9px] text-studio-gray uppercase tracking-widest font-bold whitespace-nowrap">Authentication via Email</span>
          <div className="h-[0.5px] bg-studio-border flex-1" />
        </div>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-gray group-focus-within:text-black transition-colors" size={14} />
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full border border-studio-border border-b-black p-3 pl-10 text-[10px] uppercase font-mono focus:outline-none focus:border-black transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-gray group-focus-within:text-black transition-colors" size={14} />
              <input 
                type="password" 
                placeholder="PASSWORD" 
                className="w-full border border-studio-border border-b-black p-3 pl-10 text-[10px] uppercase font-mono focus:outline-none focus:border-black transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="min-h-[20px]">
            {error && <p className="text-red-500 text-[10px] uppercase font-bold leading-tight tracking-tight">{error}</p>}
            {resetSent && <p className="text-green-600 text-[10px] uppercase font-bold tracking-tight">System: Reset link dispatched.</p>}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="bg-black text-white p-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-studio-gray active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Execute Creation')}
          </button>
        </form>

        <div className="flex flex-col gap-3 pt-4 border-t border-studio-border">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] uppercase tracking-widest font-bold text-studio-gray hover:text-black transition-colors flex items-center justify-between group"
          >
            <span>{isLogin ? "No identity on record?" : "Existing identity found?"}</span>
            <span className="flex items-center gap-1">
              {isLogin ? (
                <><UserPlus size={12} className="group-hover:translate-x-1 transition-transform" /> Sign Up</>
              ) : (
                <><ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /> Login</>
              )}
            </span>
          </button>
          
          {isLogin && (
            <button 
              onClick={handleResetPassword}
              className="text-[10px] uppercase tracking-widest font-bold text-studio-gray hover:text-red-500 transition-colors text-left"
            >
              Request Password Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
