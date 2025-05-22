import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';

import type { V1beta1Plan } from '@kubev2v/types';
import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { FormState } from '../../state/reducer';
import HooksActionHelperMessageContent from '../HooksActionHelperMessage';

import './HooksTabActions.scss';

type HooksTabActionsProps = {
  onCancel: () => void;
  onUpdate: () => void;
  plan: V1beta1Plan;
  state: FormState;
};

const HooksTabActions: FC<HooksTabActionsProps> = ({ onCancel, onUpdate, plan, state }) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <Flex>
        <FlexItem>
          <Button
            variant={ButtonVariant.primary}
            onClick={onUpdate}
            isDisabled={!state.hasChanges || !isPlanEditable(plan)}
            isLoading={state.isLoading}
          >
            {t('Update hooks')}
          </Button>
        </FlexItem>

        <FlexItem>
          <Button
            variant={ButtonVariant.secondary}
            isDisabled={!state.hasChanges}
            onClick={onCancel}
          >
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>
      <HelperText className="forklift-plan-hooks-page__helper-text">
        <HelperTextItem variant="indeterminate">
          <HooksActionHelperMessageContent
            planEditable={isPlanEditable(plan)}
            stateChanged={state.hasChanges}
          />
        </HelperTextItem>
      </HelperText>
    </>
  );
};

export default HooksTabActions;
