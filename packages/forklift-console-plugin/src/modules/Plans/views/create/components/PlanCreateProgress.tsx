import React from 'react';
import { useHistory } from 'react-router';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProgressStep, ProgressStepper } from '@patternfly/react-core';

export const PlanCreateProgress: React.FC<{ step: 'select-source' | 'migrate' }> = ({
  step = 'select-source',
}) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();

  // If we are in migration step, allow going back by clicking on the select-source
  const selectSourceStepClassName =
    step === 'migrate' ? 'forklift--create-plan--progress-current-step-clickable' : undefined;
  const selectSourceOnClick = step === 'migrate' ? history.goBack : undefined;

  return (
    <ProgressStepper
      isVertical={false}
      isCenterAligned={true}
      className="forklift--create-plan--progress"
    >
      <ProgressStep
        className={selectSourceStepClassName}
        variant={step === 'select-source' ? 'info' : 'success'}
        isCurrent={step === 'select-source'}
        description={t('Select source provider and virtual machines')}
        id="basic-alignment-step1"
        titleId="basic-alignment-step1-title"
        aria-label="select source"
        onClick={selectSourceOnClick}
      >
        {t('Select source')}
      </ProgressStep>
      <ProgressStep
        variant={step === 'migrate' ? 'info' : 'pending'}
        isCurrent={step === 'migrate'}
        description={t('Select migration target and resource mapping')}
        id="basic-alignment-step3"
        titleId="basic-alignment-step3-title"
        aria-label="migrate"
      >
        {t('Select target')}
      </ProgressStep>
    </ProgressStepper>
  );
};
