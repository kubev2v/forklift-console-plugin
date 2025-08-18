import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { EditProviderVDDKImage } from 'src/modules/Providers/modals/EditProviderVDDKImage/EditProviderVDDKImage';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

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
  const { showModal } = useModal();

  const defaultMoreInfoLink =
    'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.9/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#creating-vddk-image_mtv';
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
      data-testid="vddk-detail-item"
      title={t('VDDK init image')}
      content={
        provider?.spec?.settings?.vddkInitImage ?? (
          <Label isCompact color={'orange'}>
            <ExclamationTriangleIcon color="#F0AB00" />
            <span className="forklift-section-provider-empty-vddk-label-text">{t('Empty')}</span>
          </Label>
        )
      }
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'settings', 'vddkInitImage']}
      onEdit={() => {
        showModal(<EditProviderVDDKImage resource={provider} />);
      }}
      canEdit={canPatch}
    />
  );
};
