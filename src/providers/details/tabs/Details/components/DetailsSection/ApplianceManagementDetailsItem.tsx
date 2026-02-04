import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { OVA_APPLIANCE_MANAGEMENT_DESCRIPTION } from 'src/providers/utils/constants';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
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
  const launcher = useModal();

  const isEnabled = isApplianceManagementEnabled(provider);

  return (
    <DetailsItem
      testId="appliance-management-detail-item"
      title={t('Appliance management')}
      content={
        isEnabled ? (
          <Label isCompact status="success">
            {t('Enabled')}
          </Label>
        ) : (
          <Label isCompact>{t('Disabled')}</Label>
        )
      }
      helpContent={helpContent ?? OVA_APPLIANCE_MANAGEMENT_DESCRIPTION}
      crumbs={['Provider', 'spec', 'settings', 'applianceManagement']}
      onEdit={() => {
        launcher<EditApplianceManagementProps>(EditApplianceManagement, { provider });
      }}
      canEdit={canPatch}
    />
  );
};

export default ApplianceManagementDetailsItem;
