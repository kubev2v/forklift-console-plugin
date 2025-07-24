import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import ForkliftEmptyState from 'src/components/empty-states/ForkliftEmptyState';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useHasSufficientProviders } from 'src/utils/fetch';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, ProviderModelRef } from '@kubev2v/types';
import { Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { ALL_PROJECTS_KEY } from '@utils/constants';
import { FORKLIFT_DOCS_URL } from '@utils/links';

import PlansAddButton from './PlansAddButton';

const PlansEmptyState: FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const hasSufficientProviders = useHasSufficientProviders(namespace);

  const { canCreate } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const ProvidersListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined || namespace !== ALL_PROJECTS_KEY,
    reference: ProviderModelRef,
  });

  return (
    <ForkliftEmptyState
      icon={PlusCircleIcon}
      title={
        namespace ? (
          <ForkliftTrans>
            No plans found in the project <strong>{namespace}</strong>
          </ForkliftTrans>
        ) : (
          t('No plans found')
        )
      }
      textContent={
        hasSufficientProviders ? (
          t(
            'Migration plans are used to document the moving of virtualization workloads from source providers to target providers.',
          )
        ) : (
          <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <ForkliftTrans>
                Migration plans are used to document the moving of virtualization workloads from
                source providers to target providers. At least one source and one target provider is
                required to create a migration plan.
              </ForkliftTrans>
            </FlexItem>
            <FlexItem>
              <ExternalLink href={FORKLIFT_DOCS_URL}>
                {t('Learn more about migration plans.')}
              </ExternalLink>
            </FlexItem>
            <FlexItem>
              <Button
                variant={ButtonVariant.primary}
                component={(props) => <Link {...props} to={ProvidersListURL} />}
              >
                {t('Go to providers list')}
              </Button>
            </FlexItem>
          </Flex>
        )
      }
      callForActionButtons={
        hasSufficientProviders && <PlansAddButton namespace={namespace} canCreate={canCreate} />
      }
    />
  );
};

export default PlansEmptyState;
