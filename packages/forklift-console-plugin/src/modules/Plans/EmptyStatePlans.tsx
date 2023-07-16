import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import ForkliftEmptyState from 'src/components/empty-states/ForkliftEmptyState';
import digitalTransformation from 'src/modules/Overview/images/digitalTransormation.svg';
import { HELP_LINK_HREF } from 'src/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ExternalLink } from '@kubev2v/common';
import { PROVIDERS_REFERENCE } from '@kubev2v/legacy/common/constants';
import { CreatePlanButton } from '@kubev2v/legacy/Plans/components/CreatePlanButton';
import { createK8sPath } from '@kubev2v/legacy/queries/helpers';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

import { useHasSufficientProviders } from './data';

const AutomationIcon = () => (
  <img src={digitalTransformation} className="forklift-empty-state__icon" />
);

const EmptyStatePlans: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const hasSufficientProviders = useHasSufficientProviders(namespace);

  return (
    <ForkliftEmptyState
      icon={AutomationIcon}
      title={
        namespace ? (
          <Trans t={t} ns="plugin__forklift-console-plugin">
            No Plans found in namespace <strong>{namespace}</strong>.
          </Trans>
        ) : (
          t('No Plans found.')
        )
      }
      textContent={
        !hasSufficientProviders ? (
          <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Trans t={t} ns="plugin__forklift-console-plugin">
                Migration plans are used to plan migration or virtualization workloads from source
                providers to target providers. At least one source and one target provider must be
                available in order to create a migration plan,{' '}
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
            'Migration plans are used to plan migration or virtualization workloads from source providers to target providers.',
          )
        )
      }
      callForActionButtons={hasSufficientProviders && <CreatePlanButton namespace={namespace} />}
    />
  );
};

export default EmptyStatePlans;
