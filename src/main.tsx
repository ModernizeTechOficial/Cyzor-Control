import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { EventProvider } from './context/EventContext.tsx';
import { NavigationProvider } from './context/NavigationContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <EventProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </EventProvider>
    </AuthProvider>
  </StrictMode>,
);
