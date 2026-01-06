import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { PlanModelGroupVersionKind } from '@kubev2v/types';
import { Label } from '@patternfly/react-core';
import { ForkliftTrans } from '@utils/i18n';

export const goToPlanSubTopic = (): LearningExperienceSubTopic => {
  const navigate = useNavigate();

  return {
    id: 'go-to-plans',
    title: (
      <ForkliftTrans>
        Go to{' '}
        <Label
          color="blue"
          onClick={() => {
            navigate(getResourceUrl({ groupVersionKind: PlanModelGroupVersionKind }));
          }}
        >
          Migration plans
        </Label>
      </ForkliftTrans>
    ),
  };
};
