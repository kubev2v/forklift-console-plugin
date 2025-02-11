import React from 'react';
import { EditProviderVDDKImage, useModal } from 'src/modules/Providers/modals';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

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
    'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#creating-vddk-image_mtv';
  const defaultHelpContent = (
    <ForkliftTrans>
      Virtual Disk Development Kit (VDDK) container init image path. The path must be empty or a
      valid container image path in the format of{' '}
      <strong>registry_route_or_server_path/vddk:&#8249;tag&#8250;</strong>.<br />
      <br />
      To accelerate migrations, we recommend to specify a VDDK init image.
    </ForkliftTrans>
  );

  return (
    <DetailsItem
      title={t('VDDK init image')}
      content={
        provider?.spec?.settings?.['vddkInitImage'] || (
          <Label isCompact color={'orange'}>
            <ExclamationTriangleIcon color="#F0AB00" />
            <span className="forklift-section-provider-empty-vddk-label-text">{t('Empty')}</span>
          </Label>
        )
      }
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'settings', 'vddkInitImage']}
      onEdit={canPatch && (() => showModal(<EditProviderVDDKImage resource={provider} />))}
    />
  );
};
