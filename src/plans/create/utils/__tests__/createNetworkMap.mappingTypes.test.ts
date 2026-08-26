import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { IGNORED, MULTUS, POD } from '@utils/constants';
import { NetworkMapFieldId } from '@utils/mappings/networkMap';

import { createNetworkMap } from '../createNetworkMap';

import {
  baseParams,
  ignoreTargetMapping,
  multusMapping,
  openshiftProvider,
  podSourceMapping,
  podTargetMapping,
  vlanMapping,
} from './createNetworkMap.fixtures';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

const mockCreate = k8sCreate as jest.MockedFunction<typeof k8sCreate>;

const createdData = (): Record<string, unknown> => mockCreate.mock.calls[0][0].data as never;

describe('createNetworkMap - mapping types', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ metadata: { name: 'net-map-1' } } as never);
  });

  it('maps Multus destination with namespace/name split', async () => {
    await createNetworkMap({ ...baseParams, mappings: [multusMapping] });

    expect(createdData().spec).toMatchObject({
      map: [
        {
          destination: { name: 'my-nad', namespace: 'nad-ns', type: MULTUS },
          source: { id: 'net-1', name: 'VM Network' },
        },
      ],
    });
  });

  it('maps default/empty target to pod destination', async () => {
    await createNetworkMap({ ...baseParams, mappings: [podTargetMapping] });

    expect((createdData().spec as { map: unknown[] }).map[0]).toMatchObject({
      destination: { type: POD },
    });
  });

  it('maps ignore target to ignored destination', async () => {
    await createNetworkMap({ ...baseParams, mappings: [ignoreTargetMapping] });

    expect((createdData().spec as { map: unknown[] }).map[0]).toMatchObject({
      destination: { type: IGNORED },
    });
  });

  it('maps pod source id to pod source type', async () => {
    await createNetworkMap({ ...baseParams, mappings: [podSourceMapping] });

    expect((createdData().spec as { map: unknown[] }).map[0]).toMatchObject({
      source: { type: POD },
    });
  });

  it('sets multus source type for OpenShift providers and includes vlan', async () => {
    await createNetworkMap({
      ...baseParams,
      mappings: [vlanMapping],
      sourceProvider: openshiftProvider,
    });

    expect((createdData().spec as { map: unknown[] }).map[0]).toMatchObject({
      destination: { name: 'plain-nad', namespace: 'target-ns', type: MULTUS },
      source: {
        id: 'net-vlan',
        name: 'VLAN100',
        type: MULTUS,
        vlan: '100',
      },
    });
  });

  it('uses bare target name with targetNamespace when no slash', async () => {
    await createNetworkMap({
      ...baseParams,
      mappings: [
        {
          [NetworkMapFieldId.SourceNetwork]: { id: 'n1', name: 'src' },
          [NetworkMapFieldId.TargetNetwork]: { name: 'bare-nad' },
        },
      ],
    });

    expect((createdData().spec as { map: unknown[] }).map[0]).toMatchObject({
      destination: { name: 'bare-nad', namespace: 'target-ns', type: MULTUS },
    });
  });
});
