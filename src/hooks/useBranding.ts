import { useAuth } from '../context/AuthContext.tsx';
import { useState, useEffect } from 'react';

export function useBranding() {
  const { activeWorkspace, globalBranding } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const settings = activeWorkspace?.settings || {};
  const plan = activeWorkspace?.plan || 'Free';
  const isWhiteLabelEnabled = plan.toLowerCase() === 'pro' || plan.toLowerCase() === 'enterprise';

  // Fallback values from globalBranding
  const globalLogo = globalBranding?.globalLogoUrl || (isDarkMode ? '/logo-dark.png' : '/logo-light.png');
  const globalIcon = globalBranding?.globalIconUrl || (isDarkMode ? '/icon-dark.png' : '/icon-light.png');
  const globalLogoSize = globalBranding?.globalLogoSize || '40';
  const globalIconSize = globalBranding?.globalIconSize || '20';
  const globalAppName = globalBranding?.globalAppName || 'CYZOR';

  // Logic: Only use custom branding if plan is Pro/Enterprise AND custom branding exists
  const logoUrl = isWhiteLabelEnabled && (isDarkMode ? settings.logoDarkUrl : settings.logoLightUrl) 
    ? (isDarkMode ? settings.logoDarkUrl : settings.logoLightUrl) 
    : globalLogo;

  const iconUrl = isWhiteLabelEnabled && (isDarkMode ? settings.iconDarkUrl : settings.iconLightUrl) 
    ? (isDarkMode ? settings.iconDarkUrl : settings.iconLightUrl) 
    : globalIcon;

  const logoSize = isWhiteLabelEnabled && (isDarkMode ? settings.logoDarkSize : settings.logoLightSize) 
    ? (isDarkMode ? settings.logoDarkSize : settings.logoLightSize) 
    : globalLogoSize;

  const iconSize = isWhiteLabelEnabled && (isDarkMode ? settings.iconDarkSize : settings.iconLightSize) 
    ? (isDarkMode ? settings.iconDarkSize : settings.iconLightSize) 
    : globalIconSize;

  const appName = isWhiteLabelEnabled && settings.appName 
    ? settings.appName 
    : (activeWorkspace?.name || globalAppName);

  return {
    logoUrl,
    iconUrl,
    logoSize,
    iconSize,
    appName,
    isWhiteLabelEnabled
  };
}
