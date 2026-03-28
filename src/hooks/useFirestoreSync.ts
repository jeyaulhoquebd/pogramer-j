import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function useFirestoreSync<T>(key: string, initialValue: T, isLocal: boolean = false, uid?: string) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const targetUid = uid || auth.currentUser?.uid;

  // Sync from Firestore
  useEffect(() => {
    if (isLocal || !targetUid) return;

    const docRef = doc(db, 'userData', `${targetUid}_${key}`);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data().data as T;
        setValue(data);
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    });

    return () => unsubscribe();
  }, [key, isLocal, targetUid]);

  // Sync to Firestore
  const updateValue = async (newValue: T | ((val: T) => T)) => {
    const resolvedValue = typeof newValue === 'function' ? (newValue as Function)(value) : newValue;
    setValue(resolvedValue);
    window.localStorage.setItem(key, JSON.stringify(resolvedValue));

    if (!isLocal && targetUid) {
      try {
        const docRef = doc(db, 'userData', `${targetUid}_${key}`);
        await setDoc(docRef, { data: resolvedValue, updatedAt: Date.now() });
      } catch (error) {
        console.error('Firestore sync error:', error);
      }
    }
  };

  return [value, updateValue] as const;
}
