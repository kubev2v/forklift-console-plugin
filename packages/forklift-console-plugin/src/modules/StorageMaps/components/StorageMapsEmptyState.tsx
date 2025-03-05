import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import ForkliftEmptyState from 'src/components/empty-states/ForkliftEmptyState';
import automationIcon from 'src/components/empty-states/images/automation.svg';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useHasSufficientProviders } from 'src/utils/fetch';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ExternalLink } from '@kubev2v/common';
import { ProviderModelRef } from '@kubev2v/types';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

import { StorageMapsAddButton } from './StorageMapsAddButton';

const HELP_LINK_HREF =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/';

const AutomationIcon = () => <img src={automationIcon} className="forklift-empty-state__icon" />;

const EmptyStatePlans: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const hasSufficientProviders = useHasSufficientProviders(namespace);

  const ProvidersListURL = getResourceUrl({
    reference: ProviderModelRef,
    namespace: namespace,
    namespaced: namespace !== undefined,
  });

  return (
    <ForkliftEmptyState
      icon={AutomationIcon}
      title={
        namespace ? (
          <ForkliftTrans>
            No StorageMaps found in namespace <strong>{namespace}</strong>.
          </ForkliftTrans>
        ) : (
          t('No StorageMaps found.')
        )
      }
      textContent={
        !hasSufficientProviders ? (
          <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <ForkliftTrans>
                Migration storage maps are used to map source storages to OpenShift Virtualization
                storage classes, at least one source and one target provider must be available in
                order to create a migration storage map,{' '}
                <ExternalLink href={HELP_LINK_HREF} isInline>
                  Learn more
                </ExternalLink>
                .
              </ForkliftTrans>
            </FlexItem>
            <FlexItem>
              <Button variant="secondary">
                <Link to={ProvidersListURL}>{t('Return to the providers list page')}</Link>
              </Button>
            </FlexItem>
          </Flex>
        ) : (
          t('Migration storage maps are used to map storages between source and target providers.')
        )
      }
      callForActionButtons={
        hasSufficientProviders && <StorageMapsAddButton namespace={namespace} />
      }
    />
  );
};

export default EmptyStatePlans;
