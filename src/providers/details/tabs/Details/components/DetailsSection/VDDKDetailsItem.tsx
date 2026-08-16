import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { CREATE_VDDK_HELP_LINK, PF_LABEL_STATUS } from '@utils/constants';
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
  const launchOverlay = useOverlay();

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
      canEdit={canPatch}
      content={
        isEmpty(vddkInitImage) ? (
          <Label isCompact status={PF_LABEL_STATUS.WARNING}>
            {t('Empty')}
          </Label>
        ) : (
          vddkInitImage
        )
      }
      crumbs={['Provider', 'spec', 'settings', 'vddkInitImage']}
      helpContent={helpContent ?? defaultHelpContent}
      moreInfoLink={moreInfoLink ?? CREATE_VDDK_HELP_LINK}
      onEdit={() => {
        launchOverlay<EditProviderVDDKImageProps>(EditProviderVDDKImage, { provider });
      }}
      testId="vddk-detail-item"
      title={t('VDDK init image')}
    />
  );
};
