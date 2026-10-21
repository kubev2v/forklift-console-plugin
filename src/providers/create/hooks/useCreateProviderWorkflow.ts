import { type MutableRefObject, useCallback, useRef, useState } from 'react';
import type { UseFormHandleSubmit } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { CopyAppliancePlacementValues } from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import onCreateCopyApplianceTemplate from 'src/providers/details/tabs/Details/components/DetailsSection/onCreateCopyApplianceTemplate';
import { getProviderDetailsPageUrl } from 'src/providers/utils/getProviderDetailsPageUrl';
import { isProviderUsingCopyAppliance } from 'src/providers/utils/isProviderUsingCopyAppliance';

import type { V1beta1Provider } from '@forklift-ui/types';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getType } from '@utils/crds/common/selectors';

import { ProviderFormFieldId } from '../fields/constants';
import type { CreateProviderFormData } from '../types';
import { createProviderOnce, type ProviderCreationProgress } from '../utils/createProviderOnce';

type UseCreateProviderWorkflowParams = {
  canDeploy: boolean;
  handleSubmit: UseFormHandleSubmit<CreateProviderFormData>;
  placement: CopyAppliancePlacementValues;
};

const setRefValue = (ref: MutableRefObject<boolean>, value: boolean): void => {
  ref.current = value;
};

export const useCreateProviderWorkflow = ({
  canDeploy,
  handleSubmit,
  placement,
}: UseCreateProviderWorkflowParams): {
  apiError: Error | null;
  createdProvider: V1beta1Provider | undefined;
  isDeploying: boolean;
  isProviderPersisted: boolean;
  isSecretCreated: boolean;
  onCreate: () => Promise<boolean>;
  onDeploy: () => Promise<void>;
} => {
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

  const onCreate = useCallback(async (): Promise<boolean> => {
    let shouldContinue = false;
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

        shouldContinue = isProviderUsingCopyAppliance(provider);
        if (!shouldContinue) {
          navigate(getProviderDetailsPageUrl(provider))?.catch(() => undefined);
        }
      } catch (error) {
        setIsSecretCreated(Boolean(creationProgress.current.secret));
        setIsProviderPersisted(Boolean(creationProgress.current.provider));
        trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_FAILED, {
          error: error instanceof Error ? error.message : 'Unknown error',
          namespace,
          providerType,
        });
        setApiError(error as Error);
      }
    })();
    return shouldContinue;
  }, [handleSubmit, navigate, trackEvent]);

  const onDeploy = useCallback(async (): Promise<void> => {
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
        setRefValue(templateCreated, true);
      }
      navigate(getProviderDetailsPageUrl(provider))?.catch(() => undefined);
    } catch (error) {
      setApiError(error as Error);
    } finally {
      setRefValue(deploymentInFlight, false);
      setIsDeploying(false);
    }
  }, [canDeploy, navigate, placement]);

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
