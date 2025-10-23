import type { FC } from 'react';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useHasSufficientProviders } from 'src/utils/fetch';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, ProviderModelRef } from '@kubev2v/types';
import {
  Bullseye,
  Content,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Level,
  LevelItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { ALL_PROJECTS_KEY } from '@utils/constants';
import { FORKLIFT_DOCS_URL } from '@utils/links';

import PlansAddButton from './PlansAddButton';

type PlansEmptyStateProps = {
  namespace?: string;
};

const PlansEmptyState: FC<PlansEmptyStateProps> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const hasSufficientProviders = useHasSufficientProviders(namespace);

  const { canCreate } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const providersListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined || namespace !== ALL_PROJECTS_KEY,
    reference: ProviderModelRef,
  });

  return (
    <EmptyState
      titleText={
        namespace ? (
          <ForkliftTrans>
            No plans found in project <strong>{namespace}</strong>.
          </ForkliftTrans>
        ) : (
          t('No plans found')
        )
      }
      headingLevel="h4"
      icon={PlusCircleIcon}
    >
      <EmptyStateBody>
        {hasSufficientProviders ? (
          t(
            'Migration plans are used to document the moving of virtualization workloads from source providers to target providers.',
          )
        ) : (
          <Level hasGutter>
            <LevelItem>
              <Bullseye>
                <Content>
                  <ForkliftTrans>
                    Migration plans are used to document the moving of virtualization workloads from
                    source providers to target providers. At least one source and one target
                    provider must be available in order to create a migration plan.{' '}
                    <ExternalLink href={FORKLIFT_DOCS_URL} isInline>
                      Learn more about migration plans
                    </ExternalLink>
                    .
                  </ForkliftTrans>
                </Content>
              </Bullseye>
            </LevelItem>
          </Level>
        )}
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          {hasSufficientProviders ? (
            <PlansAddButton namespace={namespace} canCreate={canCreate} />
          ) : (
            <Content>
              <ExternalLink href={providersListURL} isInline>
                {t('Go to the providers list page')}
              </ExternalLink>
            </Content>
          )}
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default PlansEmptyState;
