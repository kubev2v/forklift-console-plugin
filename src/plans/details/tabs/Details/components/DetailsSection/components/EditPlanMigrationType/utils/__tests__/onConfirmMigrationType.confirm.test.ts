import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown => mockK8sPatch(...args),
}));

import { onConfirmMigrationType } from '../utils';

describe('EditPlanMigrationType utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue(undefined as never);
  });

  it('sets warm true for warm migrations', async () => {
    await onConfirmMigrationType({
      newValue: MigrationTypeValue.Warm,
      resource: { metadata: { name: 'p' }, spec: {} } as never,
    });

    expect(mockK8sPatch.mock.calls[0][0].data).toEqual([
      { op: 'add', path: '/spec/warm', value: true },
      { op: 'replace', path: '/spec/type', value: MigrationTypeValue.Warm },
    ]);
  });

  it('sets warm false for cold migrations', async () => {
    await onConfirmMigrationType({
      newValue: MigrationTypeValue.Cold,
      resource: { metadata: { name: 'p' }, spec: { warm: true } } as never,
    });

    expect(mockK8sPatch.mock.calls[0][0].data[0]).toEqual({
      op: 'replace',
      path: '/spec/warm',
      value: false,
    });
  });
});
