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

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId, generalFormFieldLabels } from '../general-information/constants';

const GeneralInfoReviewSection: FC = () => {
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();
  const [planName, planProject, sourceProvider, targetProvider, targetProject] = useWatch({
    control,
    name: [
      GeneralFormFieldId.PlanName,
      GeneralFormFieldId.PlanProject,
      GeneralFormFieldId.SourceProvider,
      GeneralFormFieldId.TargetProvider,
      GeneralFormFieldId.TargetProject,
    ],
  });

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.General]}
      testId="review-general-section"
      onEditClick={() => {
        goToStepById(PlanWizardStepId.General);
      }}
    >
      <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>
            {generalFormFieldLabels[GeneralFormFieldId.PlanName]}
          </DescriptionListTerm>

          <DescriptionListDescription data-testid="review-plan-name">
            {planName}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>
            {generalFormFieldLabels[GeneralFormFieldId.PlanProject]}
          </DescriptionListTerm>

          <DescriptionListDescription data-testid="review-plan-project">
            {planProject}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>
            {generalFormFieldLabels[GeneralFormFieldId.SourceProvider]}
          </DescriptionListTerm>

          <DescriptionListDescription data-testid="review-source-provider">
            {sourceProvider?.metadata?.name}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>
            {generalFormFieldLabels[GeneralFormFieldId.TargetProvider]}
          </DescriptionListTerm>

          <DescriptionListDescription data-testid="review-target-provider">
            {targetProvider?.metadata?.name}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>
            {generalFormFieldLabels[GeneralFormFieldId.TargetProject]}
          </DescriptionListTerm>

          <DescriptionListDescription data-testid="review-target-project">
            {targetProject}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </ExpandableReviewSection>
  );
};

export default GeneralInfoReviewSection;
