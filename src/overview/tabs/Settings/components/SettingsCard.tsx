import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import { ForkliftControllerModel, type V1beta1ForkliftController } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

import {
  defaultValuesMap,
  preCopyIntervalMap,
  snapshotPoolingIntervalMap,
} from '../utils/constants';
import {
  type EnhancedForkliftController,
  type SettingsEditProps,
  SettingsFields,
} from '../utils/types';

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
import SettingsEdit from './SettingsEdit';

type SettingsCardProps = {
  obj: V1beta1ForkliftController;
};

const SettingsCard: FC<SettingsCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: ForkliftControllerModel,
  });

  const controller = obj as EnhancedForkliftController;
  const spec = controller.spec ?? {};

  const formatVirtV2vValue = (value: number | undefined): string => {
    if (!value) return t('Default');
    return String(value);
  };

  return (
    <>
      <SectionHeadingWithEdit
        className="pf-v6-u-mb-md"
        data-testid="settings-edit-button"
        editable={canPatch}
        headingLevel="h3"
        onClick={() => {
          launcher<SettingsEditProps>(SettingsEdit, { controller });
        }}
        title={t('Settings')}
      />
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
          content={formatVirtV2vValue(spec?.[SettingsFields.VirtV2vMemsize])}
          helpContent={<VirtV2vMemsizeHelpContent />}
          testId="settings-virt-v2v-memsize"
          title={t('Conversion appliance memory (MB)')}
        />
        <DetailsItem
          content={formatVirtV2vValue(spec?.[SettingsFields.VirtV2vSmp])}
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
            spec?.[SettingsFields.AapUrl]?.trim()
              ? spec[SettingsFields.AapUrl]
              : t('Not configured')
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
    </>
  );
};

export default SettingsCard;
