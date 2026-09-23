export enum ProviderIssuesTableResourceId {
  Message = 'message',
  Resource = 'resource',
  Severity = 'severity',
  Type = 'type',
}

export type ProviderIssueRowData = {
  message: string | undefined;
  resource: string;
  severity: string;
  type: string;
};

export type ProviderIssuesPanelData = {
  condition: ProviderIssueRowData;
};
