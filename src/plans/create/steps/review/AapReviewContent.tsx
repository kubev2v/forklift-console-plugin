import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { AapFormFieldId } from '../migration-hooks/constants';

const AapReviewContent: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const [preJobTemplateId, postJobTemplateId] = useWatch({
    control,
    name: [AapFormFieldId.AapPreHookJobTemplateId, AapFormFieldId.AapPostHookJobTemplateId],
  });

  return (
    <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Hook source')}</DescriptionListTerm>
        <DescriptionListDescription data-testid="review-hook-source">
          {t('Ansible Automation Platform')}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>{t('Pre-hook job template ID')}</DescriptionListTerm>
        <DescriptionListDescription data-testid="review-aap-pre-hook-template">
          {preJobTemplateId ? String(preJobTemplateId) : t('None')}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>{t('Post-hook job template ID')}</DescriptionListTerm>
        <DescriptionListDescription data-testid="review-aap-post-hook-template">
          {postJobTemplateId ? String(postJobTemplateId) : t('None')}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

export default AapReviewContent;
