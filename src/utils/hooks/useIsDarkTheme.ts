import { useEffect, useState } from 'react';

export const useIsDarkTheme = (): boolean => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const checkDarkTheme = () => {
      const hasDarkTheme = document.documentElement.classList.contains('pf-v6-theme-dark');
      setIsDarkTheme(hasDarkTheme);
    };

    const observer = new MutationObserver(() => {
      checkDarkTheme();
    });

    observer.observe(document.documentElement, { attributeFilter: ['class'], attributes: true });

    checkDarkTheme();

    return () => {
      observer.disconnect();
    };
  }, []);

  return isDarkTheme;
};
