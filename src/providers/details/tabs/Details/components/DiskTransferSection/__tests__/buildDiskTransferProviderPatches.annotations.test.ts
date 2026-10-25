import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';

import { buildDiskTransferProviderPatches } from '../buildDiskTransferProviderPatches';
import { ANNOTATIONS_PATH, METHOD_PATH } from '../diskTransferPatchConstants';
import type { DiskTransferValues } from '../types';

const values: DiskTransferValues = {
  aioEnabled: false,
  method: VddkSetupMode.CopyAppliance,
  placement: {
    datastore: 'datastore',
    folder: '/folder',
    network: 'network',
    resourcePool: '/pool',
  },
  vddkImage: '',
};

const annotationPatches = (
  annotations?: Record<string, string>,
  method = values.method,
): unknown[] =>
  buildDiskTransferProviderPatches({ metadata: { annotations } } as V1beta1Provider, {
    ...values,
    method,
  }).filter(({ path }) => path.startsWith(ANNOTATIONS_PATH));

it('creates a missing parent annotation map before storing the method', () => {
  expect(annotationPatches()).toEqual([
    {
      op: 'add',
      path: ANNOTATIONS_PATH,
      value: { [DISK_TRANSFER_METHOD_ANNOTATION]: values.method },
    },
  ]);
});

it.each<Record<string, string>>([{}, { 'another.example/annotation': 'preserved' }])(
  'adds only the method key when an annotation map exists: %j',
  (annotations) => {
    expect(annotationPatches(annotations)).toEqual([
      { op: 'add', path: METHOD_PATH, value: values.method },
    ]);
  },
);

it('replaces only the selected method and preserves unrelated annotations', () => {
  expect(
    annotationPatches({ [DISK_TRANSFER_METHOD_ANNOTATION]: 'legacy', other: 'preserved' }),
  ).toEqual([{ op: 'replace', path: METHOD_PATH, value: values.method }]);
});

it('removes only the method key when leaving appliance setup', () => {
  expect(
    annotationPatches(
      { [DISK_TRANSFER_METHOD_ANNOTATION]: values.method, other: 'preserved' },
      VddkSetupMode.Skip,
    ),
  ).toEqual([{ op: 'remove', path: METHOD_PATH }]);
  expect(annotationPatches({ other: 'preserved' }, VddkSetupMode.Skip)).toEqual([]);
});
