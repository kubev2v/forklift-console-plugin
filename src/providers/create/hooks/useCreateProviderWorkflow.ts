import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import onCreateCopyApplianceTemplate from 'src/providers/details/tabs/Details/components/DetailsSection/onCreateCopyApplianceTemplate';
import { getProviderDetailsPageUrl } from 'src/providers/utils/getProviderDetailsPageUrl';
import { isProviderUsingCopyAppliance } from 'src/providers/utils/isProviderUsingCopyAppliance';

import type { V1beta1Provider } from '@forklift-ui/types';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getType } from '@utils/crds/common/selectors';

import { ProviderFormFieldId } from '../fields/constants';
import { createProviderOnce } from '../utils/createProviderOnce';
import type { ProviderCreationProgress } from '../utils/providerCreation.types';

import type {
  CreateProviderWorkflow,
  DeployProviderPlacement,
  UseCreateProviderWorkflowParams,
} from './createProviderWorkflow.types';

export const useCreateProviderWorkflow = ({
  handleSubmit,
}: UseCreateProviderWorkflowParams): CreateProviderWorkflow => {
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();
  const [apiError, setApiError] = useState<Error | null>(null);
  const [createdProvider, setCreatedProvider] = useState<V1beta1Provider>();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isProviderPersisted, setIsProviderPersisted] = useState(false);
  const [isSecretCreated, setIsSecretCreated] = useState(false);
  const creationProgress = useRef<ProviderCreationProgress>({});
  const deploymentInFlight = useRef(false);
  const templateCreated = useRef(false);

  const onCreate = useCallback(
    async (onContinue: () => void): Promise<void> => {
      await handleSubmit(async (formData) => {
        setApiError(null);
        const namespace = formData[ProviderFormFieldId.ProviderProject];
        const providerType = formData[ProviderFormFieldId.ProviderType];
        trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_STARTED, { namespace, providerType });

        try {
          const provider = await createProviderOnce(formData, creationProgress.current);
          setCreatedProvider(provider);
          trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_COMPLETED, {
            namespace,
            providerType: getType(provider),
          });

          if (isProviderUsingCopyAppliance(provider)) {
            onContinue();
            return;
          }
          navigate(getProviderDetailsPageUrl(provider))?.catch(() => undefined);
        } catch (error) {
          trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_FAILED, {
            error: error instanceof Error ? error.message : 'Unknown error',
            namespace,
            providerType,
          });
          setApiError(error as Error);
        } finally {
          setIsSecretCreated(Boolean(creationProgress.current.secret));
          setIsProviderPersisted(Boolean(creationProgress.current.provider));
        }
      })();
    },
    [handleSubmit, navigate, trackEvent],
  );

  const onDeploy = useCallback(
    async ({ canDeploy, placement }: DeployProviderPlacement): Promise<void> => {
      const { provider } = creationProgress.current;
      if (!provider || !canDeploy || deploymentInFlight.current) {
        return;
      }

      deploymentInFlight.current = true;
      setApiError(null);
      setIsDeploying(true);
      try {
        if (!templateCreated.current) {
          await onCreateCopyApplianceTemplate(provider, placement);
          // eslint-disable-next-line require-atomic-updates -- deploymentInFlight serializes deployment.
          templateCreated.current = true;
        }
        navigate(getProviderDetailsPageUrl(provider))?.catch(() => undefined);
      } catch (error) {
        setApiError(error as Error);
      } finally {
        // eslint-disable-next-line require-atomic-updates -- Only the active deployment clears its guard.
        deploymentInFlight.current = false;
        setIsDeploying(false);
      }
    },
    [navigate],
  );

  return {
    apiError,
    createdProvider,
    isDeploying,
    isProviderPersisted,
    isSecretCreated,
    onCreate,
    onDeploy,
  };
};
