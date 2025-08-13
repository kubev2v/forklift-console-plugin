export type AnalyticsConfig = {
  clusterId: string;
  segmentKey: string;
};

export type ConsoleConfigMap = {
  apiVersion: string;
  data?: {
    'console-config.yaml'?: string;
  };
  kind: string;
  metadata: {
    name: string;
    namespace: string;
  };
};
