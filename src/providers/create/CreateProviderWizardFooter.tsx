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
  canFinish: boolean;
  createdProviderUrl?: string;
  isApplianceSelected: boolean;
  isDatacenterPending: boolean;
  isSubmitting: boolean;
  onCancel: () => Promise<void>;
  onCreate: (onContinue: () => void) => Promise<void>;
  onDeploy: () => Promise<void>;
  onFinish: () => Promise<void>;
};

const CreateProviderWizardFooter: FC<CreateProviderWizardFooterProps> = ({
  canCreate,
  canDeploy,
  canFinish,
  createdProviderUrl,
  isApplianceSelected,
  isDatacenterPending,
  isSubmitting,
  onCancel,
  onCreate,
  onDeploy,
  onFinish,
}) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { activeStep, goToStepByIndex } = useWizardContext();
  const isDatacenterStep = activeStep.id === PROVIDER_PLACEMENT_STEP_ID;
  const canSubmitDatacenterStep = isApplianceSelected ? canDeploy : canFinish;
  const primaryLabel =
    isDatacenterStep && !isApplianceSelected
      ? t('Finish')
      : getCreateProviderButtonLabel(isDatacenterStep, isApplianceSelected);

  return (
    <WizardFooterWrapper>
      <ActionList>
        <ActionListGroup>
          <ActionListItem>
            <Button
              data-testid={isDatacenterStep ? 'provider-deploy-button' : 'provider-create-button'}
              isDisabled={
                isSubmitting ||
                isDatacenterPending ||
                (isDatacenterStep ? !canSubmitDatacenterStep : !canCreate)
              }
              isLoading={isSubmitting}
              onClick={async () => {
                if (isDatacenterStep) {
                  await (isApplianceSelected ? onDeploy() : onFinish());
                  return;
                }
                await onCreate(() => {
                  goToStepByIndex(PROVIDER_PLACEMENT_STEP_INDEX);
                });
              }}
              variant={ButtonVariant.primary}
            >
              {primaryLabel}
            </Button>
          </ActionListItem>
          {isDatacenterStep && isApplianceSelected && createdProviderUrl && (
            <ActionListItem>
              <Button
                data-testid="provider-skip-placement-button"
                isDisabled={isSubmitting || isDatacenterPending}
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
              onClick={async () => {
                await onCancel();
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
