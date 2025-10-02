import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  useWizardContext,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { hasLiveMigrationProviderType } from '../../utils/hasLiveMigrationProviderType';
import { hasWarmMigrationProviderType } from '../../utils/hasWarmMigrationProviderType';
import { GeneralFormFieldId } from '../general-information/constants';
import { MigrationTypeFieldId, migrationTypeLabels } from '../migration-type/constants';

const MigrationTypeReviewSection: FC<{ isLiveMigrationEnabled: boolean }> = ({
  isLiveMigrationEnabled,
}) => {
  const { t } = useForkliftTranslation();
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();
  const [migrationType, sourceProvider] = useWatch({
    control,
    name: [MigrationTypeFieldId.MigrationType, GeneralFormFieldId.SourceProvider],
  });

  const planSupportMigrationTypes =
    hasWarmMigrationProviderType(sourceProvider) ||
    (hasLiveMigrationProviderType(sourceProvider) && isLiveMigrationEnabled);

  if (!planSupportMigrationTypes) return null;

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.MigrationType]}
      testId="review-migration-type-section"
      onEditClick={() => {
        goToStepById(PlanWizardStepId.MigrationType);
      }}
    >
      <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Migration type')}</DescriptionListTerm>
          <DescriptionListDescription data-testid="review-migration-type">
            {migrationTypeLabels[migrationType]}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </ExpandableReviewSection>
  );
};

export default MigrationTypeReviewSection;
