import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { EventProvider } from './context/EventContext.tsx';
import { NavigationProvider } from './context/NavigationContext.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EventProvider>
          <NavigationProvider>
            <App />
          </NavigationProvider>
        </EventProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
