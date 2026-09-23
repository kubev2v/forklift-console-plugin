import { type FC, useState } from 'react';
import { useProvider } from 'src/providers/details/hooks/useProvider';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';
import { useProviderValidations } from 'src/virtualizationValidation/hooks/useProviderValidations';
import { VirtualizationValidationModel } from 'src/virtualizationValidation/models';
import type { ValidationRunKind } from 'src/virtualizationValidation/types';
import { buildValidation } from 'src/virtualizationValidation/utils/buildVirtualizationValidation';
import { isValidationActive } from 'src/virtualizationValidation/utils/isValidationActive';

import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
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

import ProviderValidationResults from './ProviderValidationResults';
import ProviderValidationRunForm from './ProviderValidationRunForm';

const ProviderValidationTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { provider } = useProvider(name, namespace);
  const { canCreate } = useGetDeleteAndEditAccessReview({
    model: VirtualizationValidationModel,
    namespace,
  });
  const { error: loadError, loaded, validations } = useProviderValidations(provider, namespace);
  const [createError, setCreateError] = useState<string>();
  const [creating, setCreating] = useState(false);
  const latest = validations.at(0);
  const remoteProvider = Boolean(provider?.spec?.url);

  const runValidation = async (
    runKind: ValidationRunKind,
    validationNamespace?: string,
  ): Promise<void> => {
    const validation = provider
      ? buildValidation({ provider, runKind, validationNamespace })
      : undefined;

    if (!validation) {
      setCreateError(t('The provider is missing a name or project.'));
      return;
    }

    setCreateError(undefined);
    setCreating(true);

    try {
      await k8sCreate({ data: validation, model: VirtualizationValidationModel });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : t('Unable to start validation.'));
    } finally {
      setCreating(false);
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
          {createError && <Alert isInline title={createError} variant={AlertVariant.danger} />}
          <ProviderValidationRunForm
            canCreate={canCreate}
            creating={creating}
            isRunActive={isValidationActive(latest)}
            onRun={runValidation}
          />
          {latest ? (
            <ProviderValidationResults latest={latest} />
          ) : (
            <EmptyState>
              <Title headingLevel="h2" size="lg">
                {t('No provider validation has run')}
              </Title>
              <EmptyStateBody>
                {t(
                  'Run a platform validation to check the remote OpenShift Virtualization provider.',
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
