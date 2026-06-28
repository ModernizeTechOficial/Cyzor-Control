import { useAuth } from '../context/AuthContext.tsx';
import { useState, useEffect } from 'react';

export function useBranding() {
  const { activeWorkspace } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const settings = activeWorkspace?.settings || {};

  const logoUrl = isDarkMode ? (settings.logoDarkUrl || '/logo-dark.png') : (settings.logoLightUrl || '/logo-light.png');
  const iconUrl = isDarkMode ? (settings.iconDarkUrl || '/icon-dark.png') : (settings.iconLightUrl || '/icon-light.png');
  const logoSize = isDarkMode ? (settings.logoDarkSize || 40) : (settings.logoLightSize || 40);
  const iconSize = isDarkMode ? (settings.iconDarkSize || 20) : (settings.iconLightSize || 20);

  return {
    logoUrl,
    iconUrl,
    logoSize,
    iconSize,
    appName: activeWorkspace?.name || 'CYZOR'
  };
}
