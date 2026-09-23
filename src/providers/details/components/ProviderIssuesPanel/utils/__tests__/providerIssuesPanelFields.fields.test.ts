import { describe, expect, it } from '@jest/globals';

import { providerIssuesPanelFields } from '../providerIssuesPanelFields';

describe('providerIssuesPanelFields - fields', () => {
  it('exposes field definitions for the provider issues panel', () => {
    expect(providerIssuesPanelFields).toHaveLength(3);
    expect(providerIssuesPanelFields.map((field) => field.resourceFieldId)).toEqual([
      'severity',
      'type',
      'message',
    ]);
    expect(providerIssuesPanelFields.every((field) => field.isVisible && field.sortable)).toBe(
      true,
    );
  });
});
