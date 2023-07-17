import React, { ComponentType, ReactNode } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Level,
  LevelItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
  Title,
} from '@patternfly/react-core';

interface ProvidersEmptyStateProps {
  AddButton: ReactNode;
  title: ReactNode;
  Icon: ComponentType;
}

export const ProvidersEmptyState: React.FC<ProvidersEmptyStateProps> = ({
  AddButton,
  title,
  Icon,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState>
      <EmptyStateBody style={{ textAlign: 'left' }}>
        <Level hasGutter>
          <LevelItem>
            <EmptyStateIcon icon={Icon} />
          </LevelItem>
          <LevelItem>
            <Bullseye>
              <TextContent>
                <Title headingLevel="h4" size="lg">
                  {title}
                </Title>

                <Text>{t('Migrating virtualization workloads is a multi-step process:')}</Text>
                <TextList component="ol">
                  <TextListItem>
                    {t('Add source and target providers for the migration.')}
                  </TextListItem>
                  <TextListItem>
                    {t(
                      'Map source datastores or storage domains or volume types and networks to target storage classes and networks.',
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
          </LevelItem>
        </Level>
      </EmptyStateBody>

      {AddButton}
    </EmptyState>
  );
};

export default ProvidersEmptyState;
