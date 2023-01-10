import React from 'react';
import RedHatProgressionIcon from '_/components/RedHatProgressionIcon';
import { useTranslation } from '_/utils/i18n';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Text,
  TextContent,
  TextList,
  TextListItem,
  Title,
} from '@patternfly/react-core';

import { AddProviderButton } from './ProvidersPage';

const EmptyStateProviders: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useTranslation();

  return (
    <EmptyState variant={EmptyStateVariant.large} isFullHeight>
      <EmptyStateIcon icon={RedHatProgressionIcon} />

      <Title headingLevel="h4" size="lg">
        {t('No providers have been defined.')}
      </Title>

      <EmptyStateBody style={{ textAlign: 'left' }}>
        <Bullseye>
          <TextContent>
            <Text>{t('Migrating virtualization workloads is a multi-step process.')}</Text>
            <TextList component="ol">
              <TextListItem>{t('Add source and target providers for the migration.')}</TextListItem>
              <TextListItem>
                {t(
                  'Map source datastores or storage domains and networks to target storage classes and networks.',
                )}
              </TextListItem>
              <TextListItem>
                {t(
                  'Create a migration plan and select VMs from the source provider for migration.',
                )}
              </TextListItem>
              <TextListItem>{t('Run the migration plan.')}</TextListItem>
            </TextList>
          </TextContent>
        </Bullseye>
      </EmptyStateBody>

      <AddProviderButton namespace={namespace} />
    </EmptyState>
  );
};

export default EmptyStateProviders;
