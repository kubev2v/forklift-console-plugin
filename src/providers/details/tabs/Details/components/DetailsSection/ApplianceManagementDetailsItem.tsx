import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { OVA_APPLIANCE_MANAGEMENT_DESCRIPTION } from 'src/providers/utils/constants';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { PF_LABEL_STATUS } from '@utils/constants';
import { isApplianceManagementEnabled } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderDetailsItemProps } from './utils/types';
import EditApplianceManagement, {
  type EditApplianceManagementProps,
} from './EditApplianceManagement';

const ApplianceManagementDetailsItem: FC<ProviderDetailsItemProps> = ({
  canPatch,
  helpContent,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const isEnabled = isApplianceManagementEnabled(provider);

  return (
    <DetailsItem
      canEdit={canPatch}
      content={
        isEnabled ? (
          <Label isCompact status={PF_LABEL_STATUS.SUCCESS}>
            {t('Enabled')}
          </Label>
        ) : (
          <Label isCompact>{t('Disabled')}</Label>
        )
      }
      crumbs={['Provider', 'spec', 'settings', 'applianceManagement']}
      helpContent={helpContent ?? OVA_APPLIANCE_MANAGEMENT_DESCRIPTION}
      onEdit={() => {
        launchOverlay<EditApplianceManagementProps>(EditApplianceManagement, { provider });
      }}
      testId="appliance-management-detail-item"
      title={t('Appliance management')}
    />
  );
};

export default ApplianceManagementDetailsItem;
