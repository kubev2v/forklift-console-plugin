import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  useWizardContext,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import {
  AapFormFieldId,
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
  HOOK_SOURCE_NONE,
  HooksFormFieldId,
} from '../migration-hooks/constants';

import AapReviewContent from './AapReviewContent';
import LocalHookReview from './LocalHookReview';

const HooksReviewSection: FC = () => {
  const { t } = useForkliftTranslation();
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();

  const hookSource = useWatch({ control, name: AapFormFieldId.HookSource });

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.Hooks]}
      testId="review-hooks-section"
      onEditClick={() => {
        goToStepById(PlanWizardStepId.Hooks);
      }}
    >
      {hookSource === HOOK_SOURCE_NONE && (
        <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Hook source')}</DescriptionListTerm>
            <DescriptionListDescription data-testid="review-hook-source">
              {t('No hooks configured')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      )}

      {hookSource === HOOK_SOURCE_AAP && <AapReviewContent />}

      {hookSource === HOOK_SOURCE_LOCAL && (
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXl' }}>
          <FlexItem>
            <LocalHookReview
              hookLabel={t('Pre migration hook')}
              hookFieldId={HooksFormFieldId.PreMigration}
            />
          </FlexItem>
          <FlexItem>
            <LocalHookReview
              hookLabel={t('Post migration hook')}
              hookFieldId={HooksFormFieldId.PostMigration}
            />
          </FlexItem>
        </Flex>
      )}
    </ExpandableReviewSection>
  );
};

export default HooksReviewSection;
