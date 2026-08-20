import { useEffect, useState } from 'react';

const getIsDarkTheme = (): boolean =>
  document.documentElement.classList.contains('pf-v6-theme-dark');

export const useIsDarkTheme = (): boolean => {
  const [isDarkTheme, setIsDarkTheme] = useState(getIsDarkTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(getIsDarkTheme());
    });

    observer.observe(document.documentElement, { attributeFilter: ['class'], attributes: true });

    return (): void => {
      observer.disconnect();
    };
  }, []);

  return isDarkTheme;
};
