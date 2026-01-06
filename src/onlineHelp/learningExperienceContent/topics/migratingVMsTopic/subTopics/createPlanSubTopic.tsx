import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { PlanModelRef } from '@kubev2v/types';
import { Label } from '@patternfly/react-core';
import { ForkliftTrans } from '@utils/i18n';

export const createPlanSubTopic = (): LearningExperienceSubTopic => {
  const navigate = useNavigate();

  const onClick = () => {
    const planResourceUrl = getResourceUrl({
      namespaced: false,
      reference: PlanModelRef,
    });

    navigate(`${planResourceUrl}/~new`);
  };
  return {
    id: 'create-plan',
    title: (
      <ForkliftTrans>
        Click on{' '}
        <Label color="blue" onClick={onClick}>
          Create plan
        </Label>
      </ForkliftTrans>
    ),
  };
};
