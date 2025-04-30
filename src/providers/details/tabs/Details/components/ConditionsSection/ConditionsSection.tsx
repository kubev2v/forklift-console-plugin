import type { FC, ReactElement } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { K8sResourceCondition } from '@kubev2v/types';
import { HelperText, HelperTextItem } from '@patternfly/react-core';

import ConditionsTableItem from './ConditionsTableItem';

export type ConditionsSectionProps = {
  conditions?: K8sResourceCondition[];
};

const ConditionsSection: FC<ConditionsSectionProps> = ({ conditions }): ReactElement => {
  const { t } = useForkliftTranslation();

  return (
    <ModalHOC>
      {conditions ? (
        <ConditionsTableItem conditions={conditions} />
      ) : (
        <HelperText>
          <HelperTextItem>{t('Conditions not found')}</HelperTextItem>
        </HelperText>
      )}
    </ModalHOC>
  );
};

export default ConditionsSection;
