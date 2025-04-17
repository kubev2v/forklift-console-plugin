import type { FC, ReactNode } from 'react';
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
import { PlusCircleIcon } from '@patternfly/react-icons';

import { ExternalLink } from '../../../components/common/ExternalLink/ExternalLink';
import { DOC_HELP_LINK_HREF } from '../../utils/constants';

type ProvidersEmptyStateProps = {
  AddButton: ReactNode;
  namespace?: string;
};

const ProvidersEmptyState: FC<ProvidersEmptyStateProps> = ({ AddButton, namespace }) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState>
      <EmptyStateBody style={{ textAlign: 'left' }}>
        <Level hasGutter>
          <LevelItem>{<EmptyStateIcon icon={PlusCircleIcon} />}</LevelItem>
          <LevelItem>
            <Bullseye>
              <TextContent>
                <Title headingLevel="h4" size="lg">
                  {namespace ? (
                    <ForkliftTrans>
                      No Providers found in namespace <strong>{namespace}</strong>.
                    </ForkliftTrans>
                  ) : (
                    t('No providers found')
                  )}
                </Title>
                <Text>
                  <ForkliftTrans>
                    Migrating virtualization workloads is a multi-step process.{' '}
                    <ExternalLink href={DOC_HELP_LINK_HREF} isInline>
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
