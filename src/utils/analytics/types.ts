export type AnalyticsConfig = {
  clusterId: string;
  segmentKey: string;
};

export type ConsoleConfigMap = {
  apiVersion: string;
  data?: Record<string, string>;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
  };
};
