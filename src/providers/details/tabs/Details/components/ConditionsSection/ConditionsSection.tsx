import type { FC, ReactElement } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import SectionHeading from '@components/headers/SectionHeading';
import type { K8sResourceCondition } from '@kubev2v/types';
import { HelperText, HelperTextItem, PageSection } from '@patternfly/react-core';

import ConditionsTableItem from './ConditionsTableItem';

export type ConditionsSectionProps = {
  conditions?: K8sResourceCondition[];
};

const ConditionsSection: FC<ConditionsSectionProps> = ({ conditions }): ReactElement => {
  const { t } = useForkliftTranslation();

  return (
    <PageSection hasBodyWrapper={false} className="forklift-page-section">
      <SectionHeading text={t('Conditions')} />

      {conditions ? (
        <ConditionsTableItem conditions={conditions} />
      ) : (
        <HelperText>
          <HelperTextItem>{t('Conditions not found')}</HelperTextItem>
        </HelperText>
      )}
    </PageSection>
  );
};

export default ConditionsSection;
