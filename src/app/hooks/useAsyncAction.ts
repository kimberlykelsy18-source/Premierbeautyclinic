import { useState, useCallback } from 'react';

interface AsyncActionState {
  isLoading: boolean;
  error: string | null;
}

// Replaces the repetitive pattern of:
//   const [isLoading, setIsLoading] = useState(false);
//   setIsLoading(true); try { ... } catch (e) { ... } finally { setIsLoading(false); }
//
// Usage:
//   const { isLoading, run } = useAsyncAction();
//   await run(async () => { await apiFetch(...) });
export function useAsyncAction() {
  const [state, setState] = useState<AsyncActionState>({ isLoading: false, error: null });

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    setState({ isLoading: true, error: null });
    try {
      const result = await action();
      setState({ isLoading: false, error: null });
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      setState({ isLoading: false, error: message });
      throw e;
    }
  }, []);

  return { ...state, run };
}
