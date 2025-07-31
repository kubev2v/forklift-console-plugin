import { useState, useEffect } from 'react';

import { offloadPlugins } from '../constants';

export const useOffloadPlugins = (): { loading: boolean; offloadPlugins: string[] } => {
  const [loading, setLoading] = useState<boolean>(true);
  const [plugins, setPlugins] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    setPlugins(offloadPlugins);
    setLoading(false);
  }, []);

  return { loading, offloadPlugins: plugins };
};