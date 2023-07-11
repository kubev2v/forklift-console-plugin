import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import ForkliftEmptyState from 'src/components/empty-states/ForkliftEmptyState';
import automationIcon from 'src/components/empty-states/images/automation.svg';
import { HELP_LINK_HREF } from 'src/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ExternalLink } from '@kubev2v/common';
import { PROVIDERS_REFERENCE } from '@kubev2v/legacy/common/constants';
import { createK8sPath } from '@kubev2v/legacy/queries/helpers';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

import { useHasSufficientProviders } from '../Plans/data';

import { AddNetworkMappingButton } from './NetworkMappingsPage';

const AutomationIcon = () => <img src={automationIcon} className="forklift-empty-state__icon" />;

const EmptyStatePlans: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const hasSufficientProviders = useHasSufficientProviders(namespace);

  return (
    <ForkliftEmptyState
      icon={AutomationIcon}
      title={
        namespace ? (
          <Trans t={t} ns="plugin__forklift-console-plugin">
            No NetworkMaps found in namespace <strong>{namespace}</strong>.
          </Trans>
        ) : (
          t('No NetworkMaps found.')
        )
      }
      textContent={
        !hasSufficientProviders ? (
          <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Trans t={t} ns="plugin__forklift-console-plugin">
                Migration network maps are used to map network interfaces between source and target
                virtualization providers, at least one source and one target provider must be
                available in order to create a migration storage map,{' '}
                <ExternalLink href={HELP_LINK_HREF} isInline>
                  Learn more
                </ExternalLink>
                .
              </Trans>
            </FlexItem>
            <FlexItem>
              <Button variant="secondary">
                <Link to={createK8sPath(PROVIDERS_REFERENCE, namespace)}>
                  {t('Return to the providers list page')}
                </Link>
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
        hasSufficientProviders && <AddNetworkMappingButton namespace={namespace} />
      }
    />
  );
};

export default EmptyStatePlans;
