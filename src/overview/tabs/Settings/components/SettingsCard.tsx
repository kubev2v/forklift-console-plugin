import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import { ForkliftControllerModel, type V1beta1ForkliftController } from '@kubev2v/types';
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

  return (
    <>
      <SectionHeadingWithEdit
        editable={canPatch}
        title={t('Settings')}
        onClick={() => {
          launcher<SettingsEditProps>(SettingsEdit, { controller });
        }}
      />
      <DescriptionList>
        <DetailsItem
          content={
            spec?.[SettingsFields.MaxVMInFlight] ?? defaultValuesMap[SettingsFields.MaxVMInFlight]
          }
          title={t('Maximum concurrent VM migrations')}
        />
        <DetailsItem
          content={
            spec?.[SettingsFields.ControllerCPULimit] ??
            defaultValuesMap[SettingsFields.ControllerCPULimit]
          }
          title={t('Controller main container CPU limit')}
        />
        <DetailsItem
          content={
            spec?.[SettingsFields.ControllerMemoryLimit] ??
            defaultValuesMap[SettingsFields.ControllerMemoryLimit]
          }
          title={t('Controller main container memory limit')}
        />
        <DetailsItem
          content={
            spec?.[SettingsFields.InventoryMemoryLimit] ??
            defaultValuesMap[SettingsFields.InventoryMemoryLimit]
          }
          title={t('Controller inventory container memory limit')}
        />
        <DetailsItem
          content={
            preCopyIntervalMap[
              spec?.[SettingsFields.PrecopyInterval] ??
                defaultValuesMap[SettingsFields.PrecopyInterval]
            ]
          }
          title={t('Precopy interval')}
        />
        <DetailsItem
          content={
            snapshotPoolingIntervalMap[
              spec?.[SettingsFields.SnapshotStatusCheckRate] ??
                defaultValuesMap[SettingsFields.SnapshotStatusCheckRate]
            ]
          }
          title={t('Snapshot polling interval')}
        />
      </DescriptionList>
    </>
  );
};

export default SettingsCard;
