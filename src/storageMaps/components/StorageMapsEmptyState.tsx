import type { FC } from 'react';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import StorageMapsAddButton from 'src/modules/StorageMaps/components/StorageMapsAddButton';
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

type StorageMapsEmptyStateProps = {
  namespace?: string;
};
const StorageMapsEmptyState: FC<StorageMapsEmptyStateProps> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const hasSufficientProviders = useHasSufficientProviders(namespace);

  const providersListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: ProviderModelRef,
  });

  return (
    <EmptyState
      headingLevel="h4"
      icon={PlusCircleIcon}
      titleText={
        namespace ? (
          <ForkliftTrans>
            No storage maps found in project <strong>{namespace}</strong>.
          </ForkliftTrans>
        ) : (
          t('No storage maps found')
        )
      }
    >
      <EmptyStateBody>
        {hasSufficientProviders ? (
          t('Migration storage maps are used to map storages between source and target providers.')
        ) : (
          <Level hasGutter>
            <LevelItem>
              <Bullseye>
                <Content>
                  <ForkliftTrans>
                    Migration storage maps are used to map source storages to OpenShift
                    Virtualization storage classes. At least one source and one target provider must
                    be available in order to create a migration storage map.{' '}
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
            <StorageMapsAddButton namespace={namespace} />
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

export default StorageMapsEmptyState;
