import { useEffect, useRef, useState } from 'react';
import { getInventoryApiUrl } from 'src/modules/Providers/utils/helpers/getApiUrl';

type VddkImageUrlStatus = {
  imageUrl?: string;
  status: {
    message: string;
    state?: string;
  };
};

export const useWatchVddkImage = (buildName: string | null): VddkImageUrlStatus | null => {
  const [data, setData] = useState<VddkImageUrlStatus | null>(null);
  const socketRef = useRef<WebSocket>();

  useEffect(() => {
    if (!buildName) return;

    const url = `wss://${getInventoryApiUrl(`vddk/image-url?build-name=${buildName}`)}`;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(String(event.data)) as VddkImageUrlStatus;
      setData(message);

      if (message.imageUrl) {
        ws.close();
      }
    };

    ws.onerror = (err) => {
      // eslint-disable-next-line no-console
      console.error('WebSocket error', err);
    };

    // eslint-disable-next-line @typescript-eslint/consistent-return
    return () => {
      ws.close();
    };
  }, [buildName]);

  return data;
};
