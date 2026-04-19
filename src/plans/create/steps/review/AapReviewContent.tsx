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

  const [aapUrl, preJobTemplateId, postJobTemplateId, aapTimeout] = useWatch({
    control,
    name: [
      AapFormFieldId.AapUrl,
      AapFormFieldId.AapPreHookJobTemplateId,
      AapFormFieldId.AapPostHookJobTemplateId,
      AapFormFieldId.AapTimeout,
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
        <DescriptionListTerm>{t('AAP URL')}</DescriptionListTerm>
        <DescriptionListDescription data-testid="review-aap-url">
          {aapUrl ?? t('None')}
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

      {aapTimeout ? (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Timeout')}</DescriptionListTerm>
          <DescriptionListDescription data-testid="review-aap-timeout">
            {`${String(aapTimeout)}s`}
          </DescriptionListDescription>
        </DescriptionListGroup>
      ) : null}
    </DescriptionList>
  );
};

export default AapReviewContent;
