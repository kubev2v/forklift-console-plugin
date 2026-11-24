import { type FC, useState } from 'react';
import { useProvider } from 'src/providers/details/hooks/useProvider';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';
import { useProviderValidations } from 'src/virtualizationValidation/hooks/useProviderValidations';
import { VirtualizationValidationModel } from 'src/virtualizationValidation/models';
import {
  cancelValidation,
  rerunValidation,
} from 'src/virtualizationValidation/utils/patchValidation';

import {
  Alert,
  AlertVariant,
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';

import type { ProviderDetailsPageProps } from '../../utils/types';

import ProviderValidationActions from './ProviderValidationActions';
import ProviderValidationResults from './ProviderValidationResults';

const ProviderValidationTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { provider } = useProvider(name, namespace);
  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: VirtualizationValidationModel,
    namespace,
  });
  const { error: loadError, loaded, validation } = useProviderValidations(provider, namespace);
  const [actionError, setActionError] = useState<string>();
  const [isPatching, setIsPatching] = useState(false);
  const remoteProvider = Boolean(provider?.spec?.url);

  const runAction = async (action: () => Promise<unknown>): Promise<void> => {
    setActionError(undefined);
    setIsPatching(true);
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('Unable to update validation.'));
    } finally {
      setIsPatching(false);
    }
  };

  if (!remoteProvider) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Alert
          isInline
          title={t('Validation is available for remote OpenShift providers')}
          variant={AlertVariant.info}
        >
          {t(
            'This validation runs from the hub cluster against a Provider with a configured API URL.',
          )}
        </Alert>
      </PageSection>
    );
  }

  if (loadError) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Alert isInline title={t('Unable to load validations')} variant={AlertVariant.danger} />
      </PageSection>
    );
  }

  if (!loaded) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Spinner aria-label={t('Loading validations')} />
      </PageSection>
    );
  }

  return (
    <PageSection hasBodyWrapper={false}>
      <Card>
        <CardTitle>{t('Provider validation')}</CardTitle>
        <CardBody>
          {actionError && <Alert isInline title={actionError} variant={AlertVariant.danger} />}
          {validation ? (
            <>
              <ProviderValidationResults validation={validation} />
              <ProviderValidationActions
                canPatch={canPatch}
                isPatching={isPatching}
                onAbort={async () => {
                  await runAction(async () => cancelValidation(validation));
                }}
                onRerun={async () => {
                  await runAction(async () => rerunValidation(validation));
                }}
                validation={validation}
              />
            </>
          ) : (
            <EmptyState>
              <Title headingLevel="h2" size="lg">
                {t('Waiting for provider validation')}
              </Title>
              <EmptyStateBody>
                {t(
                  'Validation starts automatically when the remote OpenShift provider becomes ready.',
                )}
              </EmptyStateBody>
            </EmptyState>
          )}
        </CardBody>
      </Card>
    </PageSection>
  );
};

export default ProviderValidationTabPage;
