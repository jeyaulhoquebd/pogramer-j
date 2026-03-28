import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, ArrowRight, Loader2, Globe, Building2, LogIn, UserPlus } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

const COUNTRIES = ['Bangladesh', 'India', 'USA', 'UK', 'Canada', 'Australia', 'Other'];
const CITIES: Record<string, string[]> = {
  'Bangladesh': ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat'],
  'USA': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
  'UK': ['London', 'Birmingham', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Hobart'],
  'Other': ['Global City']
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country || !city) {
      setError('দয়া করে সব তথ্য প্রদান করুন।');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Sign in anonymously first to have an authenticated context for the query
      const userCredential = await signInAnonymously(auth);
      const currentUser = userCredential.user;

      // 2. Search for existing user with this Name and City
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('name', '==', name.trim()), 
        where('city', '==', city)
      );
      const querySnapshot = await getDocs(q);

      if (mode === 'login') {
        if (querySnapshot.empty) {
          setError('এই নাম এবং শহরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে সাইন আপ করুন।');
          setIsLoading(false);
          return;
        }
        
        const userData = querySnapshot.docs[0].data();
        onLogin({ 
          name: userData.name, 
          country: userData.country, 
          city: userData.city, 
          uid: userData.uid, // Use the stored UID for data sync
          isLocal: false 
        });
      } else {
        // Sign Up Mode
        if (!querySnapshot.empty) {
          setError('এই নাম এবং শহরে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। দয়া করে লগইন করুন।');
          setIsLoading(false);
          return;
        }

        const newUser: UserProfile = {
          uid: currentUser.uid,
          name: name.trim(),
          country,
          city,
          isLocal: false
        };

        await setDoc(doc(db, 'users', currentUser.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        onLogin(newUser);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
        // Fallback to local mode
        onLogin({ name, country, city, isLocal: true });
      } else {
        setError('কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
    } finally {
      setIsLoading(false);
    }
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
            {mode === 'login' ? <LogIn className="w-8 h-8 text-primary" /> : <UserPlus className="w-8 h-8 text-primary" />}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'login' ? 'লগইন করুন' : 'সাইন আপ করুন'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'login' ? 'আপনার নাম এবং শহর দিয়ে প্রবেশ করুন।' : 'আপনার তথ্য দিয়ে নতুন অ্যাকাউন্ট তৈরি করুন।'}
          </p>
        </div>

        <div className="flex bg-accent/50 p-1 rounded-2xl">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
          >
            লগইন
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'signup' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
          >
            সাইন আপ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm font-medium"
            >
              {error}
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
                <Globe className="w-4 h-4" /> দেশ (Country)
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity('');
                }}
                className="w-full px-5 py-3 rounded-2xl bg-accent/50 border focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                required
              >
                <option value="">দেশ নির্বাচন করুন</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <AnimatePresence mode="wait">
              {country && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold px-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> শহর (City)
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl bg-accent/50 border focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="">শহর নির্বাচন করুন</option>
                    {CITIES[country]?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
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
                {mode === 'login' ? 'প্রবেশ করুন' : 'তৈরি করুন'} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            {mode === 'login' ? 'আপনার নাম এবং শহর দিয়ে যেকোনো ব্রাউজার থেকে লগইন করুন।' : 'আপনার তথ্য দিয়ে একটি স্থায়ী প্রোফাইল তৈরি করুন।'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
