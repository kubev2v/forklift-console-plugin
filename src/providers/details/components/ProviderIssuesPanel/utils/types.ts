export enum ProviderIssuesTableResourceId {
  Message = 'message',
  Resource = 'resource',
  Severity = 'severity',
  Type = 'type',
}

export type ProviderIssueRowData = {
  itemsCount: number;
  message: string | undefined;
  severity: string;
  type: string;
};

export type ProviderIssuesPanelData = {
  condition: ProviderIssueRowData;
  hasHostsTab: boolean;
  providerUrl: string;
};
