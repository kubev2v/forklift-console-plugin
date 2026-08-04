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
        editable={canPatch}
        title={t('Settings')}
        onClick={() => {
          launcher<SettingsEditProps>(SettingsEdit, { controller });
        }}
        className="pf-v6-u-mb-md"
        headingLevel="h3"
        data-testid="settings-edit-button"
      />
      <DescriptionList>
        <DetailsItem
          content={
            spec?.[SettingsFields.MaxVMInFlight] ?? defaultValuesMap[SettingsFields.MaxVMInFlight]
          }
          title={t('Maximum concurrent VM migrations')}
          helpContent={<MaxVMInFlightHelpContent />}
        />
        <DetailsItem
          content={
            spec?.[SettingsFields.ControllerCPULimit] ??
            defaultValuesMap[SettingsFields.ControllerCPULimit]
          }
          title={t('Controller main container CPU limit')}
          helpContent={<ControllerCPULimitHelpContent />}
        />
        <DetailsItem
          content={
            spec?.[SettingsFields.ControllerMemoryLimit] ??
            defaultValuesMap[SettingsFields.ControllerMemoryLimit]
          }
          title={t('Controller main container memory limit')}
          helpContent={<ControllerMemoryLimitHelpContent />}
        />
        <DetailsItem
          content={
            spec?.[SettingsFields.InventoryMemoryLimit] ??
            defaultValuesMap[SettingsFields.InventoryMemoryLimit]
          }
          title={t('Controller inventory container memory limit')}
          helpContent={<InventoryMemoryLimitHelpContent />}
        />
        <DetailsItem
          content={
            preCopyIntervalMap[
              spec?.[SettingsFields.PrecopyInterval] ??
                defaultValuesMap[SettingsFields.PrecopyInterval]
            ]
          }
          title={t('Precopy interval')}
          helpContent={<PreCopyIntervalHelpContent />}
        />
        <DetailsItem
          content={
            snapshotPoolingIntervalMap[
              spec?.[SettingsFields.SnapshotStatusCheckRate] ??
                defaultValuesMap[SettingsFields.SnapshotStatusCheckRate]
            ]
          }
          title={t('Snapshot polling interval')}
          helpContent={<SnapshotPoolingIntervalHelpContent />}
        />
        <DetailsItem
          testId="settings-virt-v2v-memsize"
          content={formatVirtV2vValue(spec?.[SettingsFields.VirtV2vMemsize])}
          title={t('Conversion appliance memory (MB)')}
          helpContent={<VirtV2vMemsizeHelpContent />}
        />
        <DetailsItem
          testId="settings-virt-v2v-smp"
          content={formatVirtV2vValue(spec?.[SettingsFields.VirtV2vSmp])}
          title={t('Conversion appliance vCPUs')}
          helpContent={<VirtV2vSmpHelpContent />}
        />
        <DetailsItem
          testId="settings-controller-transfer-network"
          content={
            spec?.[SettingsFields.ControllerTransferNetwork]?.trim()
              ? spec[SettingsFields.ControllerTransferNetwork]
              : t('None')
          }
          title={t('Controller transfer network')}
          helpContent={<ControllerTransferNetworkHelpContent />}
        />
        <DetailsItem
          testId="settings-aap-url"
          content={
            spec?.[SettingsFields.AapUrl]?.trim()
              ? spec[SettingsFields.AapUrl]
              : t('Not configured')
          }
          title={t('AAP URL')}
          helpContent={<AapUrlHelpContent />}
        />
        <DetailsItem
          testId="settings-aap-token-secret"
          content={
            spec?.[SettingsFields.AapTokenSecretName]?.trim()
              ? spec[SettingsFields.AapTokenSecretName]
              : t('Not configured')
          }
          title={t('AAP token secret')}
          helpContent={<AapTokenSecretHelpContent />}
        />
        <DetailsItem
          testId="settings-aap-timeout"
          content={spec?.[SettingsFields.AapTimeout] ?? defaultValuesMap[SettingsFields.AapTimeout]}
          title={t('AAP timeout (seconds)')}
          helpContent={<AapTimeoutHelpContent />}
        />
      </DescriptionList>
    </>
  );
};

export default SettingsCard;
