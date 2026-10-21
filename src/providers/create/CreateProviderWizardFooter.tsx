import { type FC, useEffect } from 'react';
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

import { PROVIDER_DETAILS_STEP_ID, PROVIDER_PLACEMENT_STEP_ID } from './utils/wizardConstants';

type CreateProviderWizardFooterProps = {
  canCreate: boolean;
  canDeploy: boolean;
  createdProviderUrl?: string;
  isApplianceSelected: boolean;
  isSubmitting: boolean;
  onCreate: () => Promise<boolean>;
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
  const { activeStep, goToStepById } = useWizardContext();
  const isPlacementStep = activeStep.id === PROVIDER_PLACEMENT_STEP_ID;
  let primaryButtonLabel = t('Create provider');

  if (isPlacementStep) {
    primaryButtonLabel = t('Deploy');
  } else if (isApplianceSelected) {
    primaryButtonLabel = t('Create and continue');
  }

  useEffect(() => {
    if (createdProviderUrl && isApplianceSelected && activeStep.id === PROVIDER_DETAILS_STEP_ID) {
      goToStepById(PROVIDER_PLACEMENT_STEP_ID);
    }
  }, [activeStep.id, createdProviderUrl, goToStepById, isApplianceSelected]);

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
                } else {
                  await onCreate();
                }
              }}
              variant={ButtonVariant.primary}
            >
              {primaryButtonLabel}
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
                } else {
                  navigate(-1)?.catch(() => undefined);
                }
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
