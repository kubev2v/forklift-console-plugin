import type { FC } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  useWizardContext,
} from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import {
  CustomScriptsFieldId,
  CustomScriptsType,
  GuestTypeLabels,
  ScriptTypeLabels,
} from '../customization-scripts/constants';

const CustomScriptsReviewSection: FC = () => {
  const { t } = useForkliftTranslation();
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();
  const { fields: scriptFields } = useFieldArray({
    control,
    name: CustomScriptsFieldId.Scripts,
  });

  const [scriptsType, existingConfigMap, scripts] = useWatch({
    control,
    name: [
      CustomScriptsFieldId.ScriptsType,
      CustomScriptsFieldId.ExistingConfigMap,
      CustomScriptsFieldId.Scripts,
    ],
  });

  return (
    <ExpandableReviewSection
      onEditClick={() => {
        goToStepById(PlanWizardStepId.Automation);
      }}
      testId="review-custom-scripts-section"
      title={planStepNames[PlanWizardStepId.Automation]}
    >
      <DescriptionList horizontalTermWidthModifier={{ default: '18ch' }} isHorizontal>
        {scriptsType === CustomScriptsType.Existing ? (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('ConfigMap')}</DescriptionListTerm>
            <DescriptionListDescription data-testid="review-custom-scripts-configmap">
              {getName(existingConfigMap) ?? t('None')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        ) : (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Scripts')}</DescriptionListTerm>
            <DescriptionListDescription data-testid="review-custom-scripts-list">
              {isEmpty(scripts)
                ? t('None')
                : scriptFields.map((field, index) => {
                    const script = scripts[index];
                    if (!script) {
                      return null;
                    }

                    return (
                      <div key={field.id}>
                        {script.name || t('Unnamed')} ({GuestTypeLabels[script.guestType]},{' '}
                        {ScriptTypeLabels[script.scriptType]})
                      </div>
                    );
                  })}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>
    </ExpandableReviewSection>
  );
};

export default CustomScriptsReviewSection;
