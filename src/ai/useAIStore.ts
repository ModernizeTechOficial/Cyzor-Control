import { useState, useEffect } from 'react';
import { aiStore, AIStoreState } from './store';

export function useAIStore(): AIStoreState {
  const [state, setState] = useState(aiStore.getState());

  useEffect(() => {
    const unsubscribe = aiStore.subscribe(() => {
      setState(aiStore.getState());
    });
    return unsubscribe;
  }, []);

  return state;
}

export { aiStore };
