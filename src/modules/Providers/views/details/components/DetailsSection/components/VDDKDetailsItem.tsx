import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { CREATE_VDDK_HELP_LINK } from 'src/plans/details/utils/constants';
import EditProviderVDDKImage, {
  type EditProviderVDDKImageProps,
} from 'src/providers/details/tabs/Details/components/DetailsSection/EditProviderVDDKImage';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const VDDKDetailsItem: FC<ProviderDetailsItemProps> = ({
  canPatch,
  helpContent,
  moreInfoLink,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const defaultHelpContent = (
    <ForkliftTrans>
      Virtual Disk Development Kit (VDDK) container init image path. The path must be empty or a
      valid container image path in the format of{' '}
      <strong>registry_route_or_server_path/vddk:&#8249;tag&#8250;</strong>.<br />
      <br />
      To accelerate migration and reduce the risk of a plan failing, it is strongly recommended to
      specify a VDDK init image.
    </ForkliftTrans>
  );

  return (
    <DetailsItem
      testId="vddk-detail-item"
      title={t('VDDK init image')}
      content={
        provider?.spec?.settings?.vddkInitImage ?? (
          <Label isCompact color={'orange'}>
            <ExclamationTriangleIcon color="#F0AB00" />
            <span className="forklift-section-provider-empty-vddk-label-text">{t('Empty')}</span>
          </Label>
        )
      }
      moreInfoLink={moreInfoLink ?? CREATE_VDDK_HELP_LINK}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'settings', 'vddkInitImage']}
      onEdit={() => {
        launcher<EditProviderVDDKImageProps>(EditProviderVDDKImage, { resource: provider });
      }}
      canEdit={canPatch}
    />
  );
};
