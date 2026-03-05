import { useState } from 'react';
import HelpIconWithLabel from 'src/plans/components/HelpIconWithLabel';
import PlanCbtWarningAlert from 'src/plans/components/PlanCbtWarningAlert';
import PlanVddkForWarmWarningAlert from 'src/plans/components/PlanVddkForWarmWarningAlert';
import {
  migrationTypeLabels,
  MigrationTypeValue,
} from 'src/plans/create/steps/migration-type/constants';
import { getMigrationTypeConfig } from 'src/plans/create/steps/migration-type/utils';
import { hasLiveMigrationProviderType } from 'src/plans/create/utils/hasLiveMigrationProviderType';
import { hasWarmMigrationProviderType } from 'src/plans/create/utils/hasWarmMigrationProviderType';
import { useCbtDisabledVms } from 'src/plans/details/hooks/useCbtDisabledVms';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Flex, FlexItem, Radio } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../../SettingsSection/utils/types';

import { onConfirmMigrationType } from './utils/utils';

const VISIBLE_TYPES: MigrationTypeValue[] = [
  MigrationTypeValue.Cold,
  MigrationTypeValue.Warm,
  MigrationTypeValue.Live,
];

const EditPlanMigrationType: ModalComponent<EditPlanProps> = ({
  isVddkInitImageNotSet,
  resource,
  sourceProvider,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [selected, setSelected] = useState<MigrationTypeValue>(getPlanMigrationType(resource));
  const [cbtDisabledVms] = useCbtDisabledVms(resource, sourceProvider);
  const isWarmSelected = selected === MigrationTypeValue.Warm;

  const canShowType = (type: MigrationTypeValue): boolean => {
    switch (type) {
      case MigrationTypeValue.Cold:
        return true;
      case MigrationTypeValue.Warm:
        return hasWarmMigrationProviderType(sourceProvider);
      case MigrationTypeValue.Live:
        return hasLiveMigrationProviderType(sourceProvider);
      case MigrationTypeValue.Conversion:
      default:
        return false;
    }
  };

  return (
    <ModalForm
      testId="edit-migration-type-modal"
      title={t('Edit migration type')}
      description={t('Set the migration type for your migration plan.')}
      onConfirm={async () => onConfirmMigrationType({ newValue: selected, resource })}
      {...rest}
    >
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        {VISIBLE_TYPES.filter(canShowType).map((type) => {
          const { description, helpBody } = getMigrationTypeConfig(type);
          const label = migrationTypeLabels[type];

          return (
            <FlexItem key={type}>
              <Radio
                id={`migration-type-${type}`}
                name="migrationType"
                data-testid={`migration-type-${type}`}
                label={
                  helpBody ? <HelpIconWithLabel label={label}>{helpBody}</HelpIconWithLabel> : label
                }
                description={description}
                isChecked={selected === type}
                onChange={() => {
                  setSelected(type);
                }}
              />
            </FlexItem>
          );
        })}
        {isWarmSelected && !isEmpty(cbtDisabledVms) && (
          <PlanCbtWarningAlert cbtDisabledVmsCount={cbtDisabledVms.length} />
        )}
        {isWarmSelected && isVddkInitImageNotSet && <PlanVddkForWarmWarningAlert />}
      </Flex>
    </ModalForm>
  );
};

export default EditPlanMigrationType;
