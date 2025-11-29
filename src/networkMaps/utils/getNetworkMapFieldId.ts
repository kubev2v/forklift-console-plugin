import { getMapFieldId } from '@utils/mapForms/getMapFieldId';

import { NetworkMapFieldId, type NetworkMapping } from '../constants';

export type NetworkMappingId = `${NetworkMapFieldId.NetworkMap}.${number}.${keyof NetworkMapping}`;

/**
 * Creates a field ID for a network mapping at a specific index
 * Used for form field identification and validation
 */
export const getNetworkMapFieldId = (id: keyof NetworkMapping, index: number): NetworkMappingId =>
  getMapFieldId(NetworkMapFieldId.NetworkMap, id, index) as NetworkMappingId;
