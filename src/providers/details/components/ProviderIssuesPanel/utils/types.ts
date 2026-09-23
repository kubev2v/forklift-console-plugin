export enum ProviderIssuesTableResourceId {
  Message = 'message',
  Severity = 'severity',
  Type = 'type',
}

export type ProviderIssueRowData = {
  message: string | undefined;
  severity: string;
  type: string;
};

export type ProviderIssuesPanelData = {
  condition: ProviderIssueRowData;
};
