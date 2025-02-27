import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import ForkliftEmptyState from 'src/components/empty-states/ForkliftEmptyState';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useHasSufficientProviders } from 'src/utils/fetch';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ExternalLink } from '@kubev2v/common';
import { ProviderModelRef } from '@kubev2v/types';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

import digitalTransformation from '../..//Overview/images/digitalTransormation.svg';

import PlansAddButton from './PlansAddButton';

const HELP_LINK_HREF =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/';

const AutomationIcon = () => (
  <img alt="automation icon" src={digitalTransformation} className="forklift-empty-state__icon" />
);

const PlansEmptyState: React.FC<{ namespace: string }> = ({ namespace }) => {
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
            No Plans found in namespace <strong>{namespace}</strong>.
          </ForkliftTrans>
        ) : (
          t('No Plans found.')
        )
      }
      textContent={
        !hasSufficientProviders ? (
          <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <ForkliftTrans>
                Migration plans are used to plan migration or virtualization workloads from source
                providers to target providers. At least one source and one target provider must be
                available in order to create a migration plan,{' '}
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
            'Migration plans are used to plan migration or virtualization workloads from source providers to target providers.',
          )
        )
      }
      callForActionButtons={hasSufficientProviders && <PlansAddButton namespace={namespace} />}
    />
  );
};

export default PlansEmptyState;
