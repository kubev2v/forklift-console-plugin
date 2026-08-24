import type { FC } from 'react';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import { DescriptionList } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import {
  defaultValuesMap,
  preCopyIntervalMap,
  snapshotPoolingIntervalMap,
} from '../utils/constants';
import { type EnhancedForkliftController, SettingsFields } from '../utils/types';

import AapTimeoutHelpContent from './AapTimeout/AapTimeoutHelpContent';
import AapTokenSecretHelpContent from './AapTokenSecret/AapTokenSecretHelpContent';
import AapUrlHelpContent from './AapUrl/AapUrlHelpContent';
import ControllerCPULimitHelpContent from './ControllerCPULimit/ControllerCPULimitHelpContent';
import ControllerMemoryLimitHelpContent from './ControllerMemoryLimit/ControllerMemoryLimitHelpContent';
import ControllerTransferNetworkHelpContent from './ControllerTransferNetwork/ControllerTransferNetworkHelpContent';
import InventoryMemoryLimitHelpContent from './InventoryMemoryLimit/InventoryMemoryLimitHelpContent';
import MaxVMInFlightHelpContent from './MaxVMInFlight/MaxVMInFlightHelpContent';
import PreCopyIntervalHelpContent from './PreCopyInterval/PreCopyIntervalHelpContent';
import SnapshotPoolingIntervalHelpContent from './SnapshotPoolingInterval/SnapshotPoolingIntervalHelpContent';
import VirtV2vMemsizeHelpContent from './VirtV2vMemsize/VirtV2vMemsizeHelpContent';
import VirtV2vSmpHelpContent from './VirtV2vSmp/VirtV2vSmpHelpContent';

type SettingsDetailsListProps = {
  controller: EnhancedForkliftController;
};

const formatVirtV2vValue = (value: number | undefined, t: (key: string) => string): string => {
  if (!value) {
    return t('Default');
  }
  return String(value);
};

const SettingsDetailsList: FC<SettingsDetailsListProps> = ({ controller }) => {
  const { t } = useForkliftTranslation();
  const spec = controller.spec ?? {};

  return (
    <DescriptionList>
      <DetailsItem
        content={
          spec?.[SettingsFields.MaxVMInFlight] ?? defaultValuesMap[SettingsFields.MaxVMInFlight]
        }
        helpContent={<MaxVMInFlightHelpContent />}
        title={t('Maximum concurrent VM migrations')}
      />
      <DetailsItem
        content={
          spec?.[SettingsFields.ControllerCPULimit] ??
          defaultValuesMap[SettingsFields.ControllerCPULimit]
        }
        helpContent={<ControllerCPULimitHelpContent />}
        title={t('Controller main container CPU limit')}
      />
      <DetailsItem
        content={
          spec?.[SettingsFields.ControllerMemoryLimit] ??
          defaultValuesMap[SettingsFields.ControllerMemoryLimit]
        }
        helpContent={<ControllerMemoryLimitHelpContent />}
        title={t('Controller main container memory limit')}
      />
      <DetailsItem
        content={
          spec?.[SettingsFields.InventoryMemoryLimit] ??
          defaultValuesMap[SettingsFields.InventoryMemoryLimit]
        }
        helpContent={<InventoryMemoryLimitHelpContent />}
        title={t('Controller inventory container memory limit')}
      />
      <DetailsItem
        content={
          preCopyIntervalMap[
            spec?.[SettingsFields.PrecopyInterval] ??
              defaultValuesMap[SettingsFields.PrecopyInterval]
          ]
        }
        helpContent={<PreCopyIntervalHelpContent />}
        title={t('Precopy interval')}
      />
      <DetailsItem
        content={
          snapshotPoolingIntervalMap[
            spec?.[SettingsFields.SnapshotStatusCheckRate] ??
              defaultValuesMap[SettingsFields.SnapshotStatusCheckRate]
          ]
        }
        helpContent={<SnapshotPoolingIntervalHelpContent />}
        title={t('Snapshot polling interval')}
      />
      <DetailsItem
        content={formatVirtV2vValue(spec?.[SettingsFields.VirtV2vMemsize], t)}
        helpContent={<VirtV2vMemsizeHelpContent />}
        testId="settings-virt-v2v-memsize"
        title={t('Conversion appliance memory (MB)')}
      />
      <DetailsItem
        content={formatVirtV2vValue(spec?.[SettingsFields.VirtV2vSmp], t)}
        helpContent={<VirtV2vSmpHelpContent />}
        testId="settings-virt-v2v-smp"
        title={t('Conversion appliance vCPUs')}
      />
      <DetailsItem
        content={
          spec?.[SettingsFields.ControllerTransferNetwork]?.trim()
            ? spec[SettingsFields.ControllerTransferNetwork]
            : t('None')
        }
        helpContent={<ControllerTransferNetworkHelpContent />}
        testId="settings-controller-transfer-network"
        title={t('Controller transfer network')}
      />
      <DetailsItem
        content={
          spec?.[SettingsFields.AapUrl]?.trim() ? spec[SettingsFields.AapUrl] : t('Not configured')
        }
        helpContent={<AapUrlHelpContent />}
        testId="settings-aap-url"
        title={t('AAP URL')}
      />
      <DetailsItem
        content={
          spec?.[SettingsFields.AapTokenSecretName]?.trim()
            ? spec[SettingsFields.AapTokenSecretName]
            : t('Not configured')
        }
        helpContent={<AapTokenSecretHelpContent />}
        testId="settings-aap-token-secret"
        title={t('AAP token secret')}
      />
      <DetailsItem
        content={spec?.[SettingsFields.AapTimeout] ?? defaultValuesMap[SettingsFields.AapTimeout]}
        helpContent={<AapTimeoutHelpContent />}
        testId="settings-aap-timeout"
        title={t('AAP timeout (seconds)')}
      />
    </DescriptionList>
  );
};

export default SettingsDetailsList;
