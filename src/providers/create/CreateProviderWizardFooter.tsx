import type { FC } from 'react';
import { useNavigate } from 'react-router';

import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  ButtonVariant,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { getCreateProviderButtonLabel } from './utils/getCreateProviderButtonLabel';
import { PROVIDER_PLACEMENT_STEP_ID, PROVIDER_PLACEMENT_STEP_INDEX } from './utils/wizardConstants';

type CreateProviderWizardFooterProps = {
  canCreate: boolean;
  canDeploy: boolean;
  createdProviderUrl?: string;
  isApplianceSelected: boolean;
  isSubmitting: boolean;
  onCreate: (onContinue: () => void) => Promise<void>;
  onDeploy: () => Promise<void>;
};

const CreateProviderWizardFooter: FC<CreateProviderWizardFooterProps> = ({
  canCreate,
  canDeploy,
  createdProviderUrl,
  isApplianceSelected,
  isSubmitting,
  onCreate,
  onDeploy,
}) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { activeStep, goToStepByIndex } = useWizardContext();
  const isPlacementStep = activeStep.id === PROVIDER_PLACEMENT_STEP_ID;

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button
              data-testid={isPlacementStep ? 'provider-deploy-button' : 'provider-create-button'}
              isDisabled={isSubmitting || (isPlacementStep ? !canDeploy : !canCreate)}
              isLoading={isSubmitting}
              onClick={async () => {
                if (isPlacementStep) {
                  await onDeploy();
                  return;
                }
                await onCreate(() => {
                  goToStepByIndex(PROVIDER_PLACEMENT_STEP_INDEX);
                });
              }}
              variant={ButtonVariant.primary}
            >
              {getCreateProviderButtonLabel(isPlacementStep, isApplianceSelected)}
            </Button>
          </ActionListItem>
          {isPlacementStep && createdProviderUrl && (
            <ActionListItem>
              <Button
                data-testid="provider-skip-placement-button"
                isDisabled={isSubmitting}
                onClick={() => {
                  navigate(createdProviderUrl)?.catch(() => undefined);
                }}
                variant={ButtonVariant.secondary}
              >
                {t('Skip for now')}
              </Button>
            </ActionListItem>
          )}
        </ActionListGroup>
        <ActionListGroup>
          <ActionListItem>
            <Button
              data-testid="provider-cancel-button"
              isDisabled={isSubmitting}
              onClick={() => {
                if (createdProviderUrl) {
                  navigate(createdProviderUrl)?.catch(() => undefined);
                  return;
                }
                navigate(-1)?.catch(() => undefined);
              }}
              variant={ButtonVariant.link}
            >
              {t('Cancel')}
            </Button>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </WizardFooterWrapper>
  );
};

export default CreateProviderWizardFooter;
