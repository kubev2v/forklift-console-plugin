import type { FC } from 'react';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import NetworkMapsAddButton from 'src/modules/NetworkMaps/components/NetworkMapsAddButton';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useHasSufficientProviders } from 'src/utils/fetch';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';
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
import { FORKLIFT_DOCS_URL } from '@utils/links';

type NetworkMapsEmptyStateProps = {
  namespace?: string;
};
const NetworkMapsEmptyState: FC<NetworkMapsEmptyStateProps> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const hasSufficientProviders = useHasSufficientProviders(namespace);

  const providersListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: ProviderModelRef,
  });

  return (
    <EmptyState
      titleText={
        namespace ? (
          <ForkliftTrans>
            No network maps found in project <strong>{namespace}</strong>.
          </ForkliftTrans>
        ) : (
          t('No network maps found')
        )
      }
      headingLevel="h4"
      icon={PlusCircleIcon}
    >
      <EmptyStateBody>
        {hasSufficientProviders ? (
          t('Migration network maps are used to map networks between source and target providers.')
        ) : (
          <Level hasGutter>
            <LevelItem>
              <Bullseye>
                <Content>
                  <ForkliftTrans>
                    Migration network maps are used to map network interfaces between source and
                    target virtualization providers. At least one source and one target provider
                    must be available in order to create a migration network map.{' '}
                    <ExternalLink href={FORKLIFT_DOCS_URL} isInline>
                      Learn more
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
            <NetworkMapsAddButton namespace={namespace} />
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

export default NetworkMapsEmptyState;
