import type { FC } from 'react';

import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import './PlanMappingsActionsBar.scss';

type PlanMappingsActionsBarProps = {
  isLoading: boolean;
  dataChanged: boolean;
  reset: (preserveUpdated?: boolean) => void;
  onUpdate: () => void;
};

const PlanMappingsActionsBar: FC<PlanMappingsActionsBarProps> = ({
  dataChanged,
  isLoading,
  onUpdate,
  reset,
}) => {
  const { t } = useForkliftTranslation();
  return (
    <>
      <Flex>
        <FlexItem>
          <Button
            variant={ButtonVariant.primary}
            onClick={onUpdate}
            isDisabled={!dataChanged}
            isLoading={isLoading}
            data-testid="update-mappings-button"
          >
            {t('Update mappings')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => {
              reset();
            }}
            data-testid="cancel-mappings-button"
          >
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>
      <HelperText className="forklift-plan-mappings-actions-bar__helper-text">
        <HelperTextItem>
          {t(
            'Click the update mappings button to save your changes, button is disabled until a change is detected.',
          )}
        </HelperTextItem>
      </HelperText>
    </>
  );
};

export default PlanMappingsActionsBar;
