import type { ComponentType, FC, ReactNode } from 'react';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

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

const HELP_LINK_HREF =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/';

type ProvidersEmptyStateProps = {
  AddButton: ReactNode;
  title: ReactNode;
  Icon: ComponentType;
};

const ProvidersEmptyState: FC<ProvidersEmptyStateProps> = ({ AddButton, Icon, title }) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState>
      <EmptyStateBody style={{ textAlign: 'left' }}>
        <Level hasGutter>
          <LevelItem>{Icon && <EmptyStateIcon icon={Icon} />}</LevelItem>
          <LevelItem>
            <Bullseye>
              <TextContent>
                <Title headingLevel="h4" size="lg">
                  {title}
                </Title>
                <Text>
                  <ForkliftTrans>
                    Migrating virtualization workloads is a multi-step process.{' '}
                    <ExternalLink href={HELP_LINK_HREF} isInline>
                      Learn more
                    </ExternalLink>
                    .
                  </ForkliftTrans>
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
