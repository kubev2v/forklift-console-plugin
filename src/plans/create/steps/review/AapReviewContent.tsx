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

const formatTemplateDisplay = (
  id: number | undefined,
  name: string | undefined,
  fallback: string,
  translate: (key: string, options?: Record<string, unknown>) => string,
): string => {
  if (id === undefined) return fallback;
  return name ? translate('{{name}} (ID: {{id}})', { id: String(id), name }) : String(id);
};

const AapReviewContent: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const [preJobTemplateId, preJobTemplateName, postJobTemplateId, postJobTemplateName] = useWatch({
    control,
    name: [
      AapFormFieldId.AapPreHookJobTemplateId,
      AapFormFieldId.AapPreHookJobTemplateName,
      AapFormFieldId.AapPostHookJobTemplateId,
      AapFormFieldId.AapPostHookJobTemplateName,
    ],
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
        <DescriptionListTerm>{t('Pre-migration hook')}</DescriptionListTerm>
        <DescriptionListDescription data-testid="review-aap-pre-hook-template">
          {formatTemplateDisplay(preJobTemplateId, preJobTemplateName, t('None'), t)}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>{t('Post-migration hook')}</DescriptionListTerm>
        <DescriptionListDescription data-testid="review-aap-post-hook-template">
          {formatTemplateDisplay(postJobTemplateId, postJobTemplateName, t('None'), t)}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

export default AapReviewContent;
