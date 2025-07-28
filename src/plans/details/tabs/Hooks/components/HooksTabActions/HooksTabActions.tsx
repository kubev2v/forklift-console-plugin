import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { HookFormValues } from '../../state/types';

type HooksTabActionsProps = {
  onCancel: () => void;
  onUpdate: () => void;
  planEditable: boolean;
};

const HooksTabActions: FC<HooksTabActionsProps> = ({ onCancel, onUpdate, planEditable }) => {
  const { t } = useForkliftTranslation();
  const {
    formState: { isDirty, isSubmitting },
  } = useFormContext<HookFormValues>();

  return (
    <>
      <Flex>
        <FlexItem>
          <Button
            variant={ButtonVariant.primary}
            onClick={onUpdate}
            isDisabled={!isDirty || !planEditable}
            isLoading={isSubmitting}
          >
            {t('Update hooks')}
          </Button>
        </FlexItem>

        <FlexItem>
          <Button variant={ButtonVariant.secondary} isDisabled={!isDirty} onClick={onCancel}>
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>
      {!planEditable && (
        <HelperText className="forklift-plan-hooks-page__helper-text">
          <HelperTextItem variant="indeterminate">
            {t('Can not update plan hooks when the plan is not editable.')}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

export default HooksTabActions;
