import { DefaultNetworkLabel } from 'src/plans/details/tabs/Mappings/utils/constants';

import { NetworkMapFieldId, type NetworkMapping } from '../network-map/constants';

import { OtherSettingsFormFieldId } from './constants';

type DiskPassPhraseId = `${OtherSettingsFormFieldId.DiskDecryptionPassPhrases}.${number}.value`;

export const getDiskPassPhraseFieldId = (index: number): DiskPassPhraseId =>
  `${OtherSettingsFormFieldId.DiskDecryptionPassPhrases}.${index}.value`;

export const isMapToPod = (networkMap: NetworkMapping[]): boolean =>
  networkMap?.some(
    (entry) => entry[NetworkMapFieldId.TargetNetwork]?.name === DefaultNetworkLabel.Source,
  ) ?? false;
