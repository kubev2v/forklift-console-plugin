import React from 'react';
import { Link } from 'react-router-dom';
import ForkliftEmptyState from 'src/components/empty-states/ForkliftEmptyState';
import automationIcon from 'src/components/empty-states/images/automation.svg';
import { useHasSufficientProviders } from 'src/modules/Plans/data';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { HELP_LINK_HREF } from 'src/utils/constants';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ExternalLink } from '@kubev2v/common';
import { ProviderModelRef } from '@kubev2v/types';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

import { StorageMapsAddButton } from './StorageMapsAddButton';

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
                Migration network maps are used to map network interfaces between source and target
                virtualization providers, at least one source and one target provider must be
                available in order to create a migration storage map,{' '}
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
          t(
            'Migration networks maps are used to map network interfaces between source and target workloads.',
          )
        )
      }
      callForActionButtons={
        hasSufficientProviders && <StorageMapsAddButton namespace={namespace} />
      }
    />
  );
};

export default EmptyStatePlans;
