import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Page = 'home' | 'library' | 'capture' | 'lesson' | 'quiz' | 'flashcards' | 'progress';

interface RouteState {
  page: Page;
  sessionId: string | null;
}

interface RouterContextValue extends RouteState {
  navigate: (page: Page, sessionId?: string | null) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<RouteState>({ page: 'home', sessionId: null });

  const navigate = useCallback((page: Page, sessionId: string | null = null) => {
    setRoute({ page, sessionId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <RouterContext.Provider value={{ ...route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
