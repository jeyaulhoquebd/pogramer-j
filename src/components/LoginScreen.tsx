import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface LoginScreenProps {
  onLogin: (profile: { name: string; address: string }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setError('দয়া করে নাম এবং ঠিকানা উভয়ই প্রদান করুন।');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Sign in anonymously to have a Firebase context
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Save profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Pass to parent
      onLogin({ name, address });
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/admin-restricted-operation') {
        setError('ফায়ারবেস কনসোলে "Anonymous Authentication" বন্ধ আছে। দয়া করে এটি সচল করুন। (Authentication > Sign-in method > Anonymous > Enable)');
        // Allow fallback to local mode for testing
        setCanFallback(true);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('এই লগইন পদ্ধতিটি সচল করা হয়নি। দয়া করে ফায়ারবেস কনসোল চেক করুন।');
      } else {
        setError('কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [canFallback, setCanFallback] = useState(false);

  const handleFallback = () => {
    onLogin({ name, address });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border rounded-3xl shadow-2xl p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">স্বাগতম!</h1>
          <p className="text-muted-foreground">আপনার নাম এবং ঠিকানা দিয়ে প্রবেশ করুন।</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm font-medium space-y-2"
            >
              <p>{error}</p>
              {canFallback && (
                <button 
                  type="button"
                  onClick={handleFallback}
                  className="w-full py-2 bg-destructive/20 hover:bg-destructive/30 rounded-xl text-xs font-bold transition-colors"
                >
                  অফলাইন মোডে প্রবেশ করুন (শুধুমাত্র এই ব্রাউজারে)
                </button>
              )}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold px-1 flex items-center gap-2">
                <User className="w-4 h-4" /> নাম (Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="w-full px-5 py-3 rounded-2xl bg-accent/50 border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold px-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> ঠিকানা (Address)
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="আপনার ঠিকানা লিখুন"
                className="w-full px-5 py-3 rounded-2xl bg-accent/50 border focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                প্রবেশ করুন <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            আপনার তথ্য শুধুমাত্র আপনার ব্রাউজারে সংরক্ষিত থাকবে।
          </p>
        </div>
      </motion.div>
    </div>
  );
}
