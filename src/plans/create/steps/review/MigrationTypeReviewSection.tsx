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

const MigrationTypeReviewSection: FC<{ isLiveMigrationFeatureEnabled: boolean }> = ({
  isLiveMigrationFeatureEnabled,
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
    (hasLiveMigrationProviderType(sourceProvider) && isLiveMigrationFeatureEnabled);

  if (!planSupportMigrationTypes) {
    return null;
  }

  return (
    <ExpandableReviewSection
      onEditClick={() => {
        goToStepById(PlanWizardStepId.MigrationType);
      }}
      testId="review-migration-type-section"
      title={planStepNames[PlanWizardStepId.MigrationType]}
    >
      <DescriptionList horizontalTermWidthModifier={{ default: '18ch' }} isHorizontal>
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
