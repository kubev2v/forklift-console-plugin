import React, { ComponentType, ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { HELP_LINK_HREF } from 'src/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ExternalLink } from '@kubev2v/common';
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
                <Text>
                  <Trans>
                    Migrating virtualization workloads is a multi-step process.{' '}
                    <ExternalLink href={HELP_LINK_HREF} isInline>
                      Learn more
                    </ExternalLink>
                    .
                  </Trans>
                </Text>
                <TextList component="ol">
                  <TextListItem>
                    {t('Add source and target providers for the migration.')}
                  </TextListItem>
                  <TextListItem>
                    {t(
                      'Map source datastores, storage domains, volume types, storage classes and networks to their respective target storage classes and networks.',
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
