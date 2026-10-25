import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1CopyApplianceTemplate, V1beta1Provider } from '@forklift-ui/types';
import { DescriptionList } from '@patternfly/react-core';
import { getUseVddkAioOptimization, getVddkInitImage } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import {
  COPY_APPLIANCE_SETTING_FIELDS,
  COPY_APPLIANCE_SETTING_GETTERS,
} from '../DetailsSection/copyAppliancePlacementConfig';
import CopyApplianceSSHSecretsDetailsItem from '../DetailsSection/CopyApplianceSSHSecretsDetailsItem';
import CopyApplianceTemplateDetailsItem from '../DetailsSection/CopyApplianceTemplateDetailsItem';
import { useCopyAppliancePlacementLabels } from '../DetailsSection/useCopyAppliancePlacementLabels';

import { getApplianceStatusLabel, getDiskTransferMethodLabel } from './diskTransferDisplay';
import type { CopyApplianceDisplayStatus } from './types';

type DiskTransferDetailsProps = {
  method: VddkSetupMode;
  provider: V1beta1Provider;
  template?: V1beta1CopyApplianceTemplate;
  templateStatus: CopyApplianceDisplayStatus;
};

const DiskTransferDetails: FC<DiskTransferDetailsProps> = ({
  method,
  provider,
  template,
  templateStatus,
}) => {
  const { t } = useForkliftTranslation();
  const placementLabels = useCopyAppliancePlacementLabels();
  const isVddk = method === VddkSetupMode.Manual || method === VddkSetupMode.Upload;

  return (
    <DescriptionList columnModifier={{ default: '2Col' }}>
      <DetailsItem
        content={getDiskTransferMethodLabel(method)}
        testId="disk-transfer-method"
        title={t('Method')}
      />
      {isVddk && (
        <>
          <DetailsItem
            content={getVddkInitImage(provider) ?? ''}
            testId="disk-transfer-vddk-image"
            title={t('VDDK init image')}
          />
          <DetailsItem
            content={getUseVddkAioOptimization(provider) === 'true' ? t('Enabled') : t('Disabled')}
            testId="disk-transfer-aio"
            title={t('VDDK async IO optimization')}
          />
        </>
      )}
      {method === VddkSetupMode.CopyAppliance && (
        <DetailsItem
          content={getApplianceStatusLabel(templateStatus)}
          testId="disk-transfer-appliance-status"
          title={t('Sourcing appliance status')}
        />
      )}
      {method === VddkSetupMode.CopyAppliance &&
        templateStatus !== 'pending' &&
        COPY_APPLIANCE_SETTING_FIELDS.map((field) => (
          <DetailsItem
            content={
              COPY_APPLIANCE_SETTING_GETTERS[field](provider) ?? (
                <span className="text-muted">-</span>
              )
            }
            key={field}
            testId={`disk-transfer-${field}`}
            title={placementLabels[field].label}
          />
        ))}
      {method === VddkSetupMode.CopyAppliance && template && (
        <>
          <CopyApplianceTemplateDetailsItem resource={provider} />
          <CopyApplianceSSHSecretsDetailsItem resource={provider} />
        </>
      )}
    </DescriptionList>
  );
};

export default DiskTransferDetails;
