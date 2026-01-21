import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { CREATE_VDDK_HELP_LINK } from '@utils/constants';
import { getVddkInitImage } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import type { ProviderDetailsItemProps } from './utils/types';
import EditProviderVDDKImage, { type EditProviderVDDKImageProps } from './EditProviderVDDKImage';

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

  const vddkInitImage = getVddkInitImage(provider);
  return (
    <DetailsItem
      testId="vddk-detail-item"
      title={t('VDDK init image')}
      content={
        isEmpty(vddkInitImage) ? (
          <Label isCompact status="warning">
            {t('Empty')}
          </Label>
        ) : (
          vddkInitImage
        )
      }
      moreInfoLink={moreInfoLink ?? CREATE_VDDK_HELP_LINK}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'settings', 'vddkInitImage']}
      onEdit={() => {
        launcher<EditProviderVDDKImageProps>(EditProviderVDDKImage, { provider });
      }}
      canEdit={canPatch}
    />
  );
};
