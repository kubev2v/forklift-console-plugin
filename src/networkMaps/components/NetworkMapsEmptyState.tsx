import type { FC } from 'react';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import NetworkMapsAddButton from 'src/modules/NetworkMaps/components/NetworkMapsAddButton';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useHasSufficientProviders } from 'src/utils/fetch';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';
import {
  Bullseye,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Level,
  LevelItem,
  TextContent,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { FORKLIFT_DOCS_URL } from '@utils/links';

type NetworkMapsEmptyStateProps = {
  namespace?: string;
};
const NetworkMapsEmptyState: FC<NetworkMapsEmptyStateProps> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const hasSufficientProviders = useHasSufficientProviders(namespace);

  const ProvidersListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: ProviderModelRef,
  });

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={
          namespace ? (
            <ForkliftTrans>
              No Network maps found in namespace <strong>{namespace}</strong>.
            </ForkliftTrans>
          ) : (
            t('No Network maps found')
          )
        }
        headingLevel="h4"
        icon={<EmptyStateIcon icon={CubesIcon} />}
      />
      <EmptyStateBody>
        {hasSufficientProviders ? (
          t('Migration network maps are used to map networks between source and target providers.')
        ) : (
          <Level hasGutter>
            <LevelItem>
              <Bullseye>
                <TextContent>
                  <ForkliftTrans>
                    Migration network maps are used to map network interfaces between source and
                    target virtualization providers, at least one source and one target provider
                    must be available in order to create a migration network map,{' '}
                    <ExternalLink href={FORKLIFT_DOCS_URL} isInline>
                      Learn more
                    </ExternalLink>
                    .
                  </ForkliftTrans>
                </TextContent>
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
            <ExternalLink href={ProvidersListURL} isInline={false} hideIcon={true}>
              {t('Return to the providers list page')}
            </ExternalLink>
          )}
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default NetworkMapsEmptyState;
