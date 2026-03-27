import React, { useState } from 'react';
import { auth, googleProvider, db, OperationType, handleFirestoreError } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn, LogOut, ShieldCheck, Github, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create user profile if it doesn't exist
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        try {
          await setDoc(userDocRef, userData);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
              <img 
                src="https://pbs.twimg.com/media/HEbd_28b0AEJvJD?format=jpg&name=small" 
                alt="Logo" 
                className="w-full h-full object-cover rounded-3xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-foreground">Pogramer</h1>
            <p className="text-muted-foreground text-lg">Your minimalist productivity suite.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-3xl p-8 shadow-xl space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to sync your progress across devices.</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-foreground text-background py-4 rounded-2xl font-semibold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 border py-3 rounded-2xl hover:bg-accent transition-colors opacity-50 cursor-not-allowed">
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">GitHub</span>
            </button>
            <button className="flex items-center justify-center gap-2 border py-3 rounded-2xl hover:bg-accent transition-colors opacity-50 cursor-not-allowed">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-medium">SSO</span>
            </button>
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export const UserProfile: React.FC = () => {
  const user = auth.currentUser;
  
  if (!user) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-accent/50 border border-border/50">
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
        <img 
          src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
          alt="Avatar" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{user.displayName || 'User'}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <button 
        onClick={() => signOut(auth)}
        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};
