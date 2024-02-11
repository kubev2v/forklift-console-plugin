import React from 'react';
import { EditProviderVDDKImage, useModal } from 'src/modules/Providers/modals';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { DetailsItem } from '../../../../../utils';

import { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const VDDKDetailsItem: React.FC<ProviderDetailsItemProps> = ({
  resource: provider,
  canPatch,
  moreInfoLink,
  helpContent,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultMoreInfoLink =
    'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.5/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#creating-vddk-image_mtv';
  const defaultHelpContent = (
    <ForkliftTrans>
      Virtual Disk Development Kit (VDDK) container init image path. The path must be empty or a
      valid container image path in the format of{' '}
      <strong>registry_route_or_server_path/vddk:&#8249;tag&#8250;</strong>.<br />
      <br />
      For example: <strong>quay.io/kubev2v/example:latest</strong>.<br />
      <br />
      It is strongly recommended to specify a VDDK init image to accelerate migrations.
    </ForkliftTrans>
  );

  return (
    <DetailsItem
      title={t('VDDK init image')}
      content={
        provider?.spec?.settings?.['vddkInitImage'] || (
          <span className="text-muted">{t('Empty')}</span>
        )
      }
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'settings', 'vddkInitImage']}
      onEdit={canPatch && (() => showModal(<EditProviderVDDKImage resource={provider} />))}
    />
  );
};
