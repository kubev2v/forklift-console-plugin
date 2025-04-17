import type { FC } from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';
import { DOC_MAIN_HELP_LINK } from 'src/utils/links';

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

import ProvidersAddButton from './ProvidersAddButton';

import './ProvidersEmptyState.style.scss';

type ProvidersEmptyStateProps = {
  namespace?: string;
  canCreate?: boolean | undefined;
};

const ProvidersEmptyState: FC<ProvidersEmptyStateProps> = ({ canCreate, namespace }) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState>
      <EmptyStateBody className="providers-empty-state-section">
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
                    <ExternalLink href={DOC_MAIN_HELP_LINK} isInline>
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
      <ProvidersAddButton
        dataTestId="add-provider-button-empty-state"
        namespace={namespace}
        canCreate={canCreate}
      />
    </EmptyState>
  );
};

export default ProvidersEmptyState;
