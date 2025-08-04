import type { FC } from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';
import { DOC_MAIN_HELP_LINK } from 'src/utils/links';

import {
  Bullseye,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Level,
  LevelItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { ExternalLink } from '../../../components/common/ExternalLink/ExternalLink';

import ProvidersAddButton from './ProvidersAddButton';

type ProvidersEmptyStateProps = {
  namespace?: string;
  canCreate?: boolean | undefined;
};

const ProvidersEmptyState: FC<ProvidersEmptyStateProps> = ({ canCreate, namespace }) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={
          namespace ? (
            <ForkliftTrans>
              No providers found in project <strong>{namespace}</strong>
            </ForkliftTrans>
          ) : (
            t('No providers found')
          )
        }
        headingLevel="h4"
        icon={<EmptyStateIcon icon={PlusCircleIcon} />}
      />
      <EmptyStateBody>
        <Level hasGutter>
          <LevelItem>
            <Bullseye>
              <TextContent>
                <Text>
                  <ForkliftTrans>
                    Migrating virtualization workloads is a multi-step process.{' '}
                    <ExternalLink href={DOC_MAIN_HELP_LINK} isInline>
                      Learn more
                    </ExternalLink>
                    .
                  </ForkliftTrans>
                </Text>
                <TextList isPlain>
                  <TextListItem>
                    {t('1. Add source and target providers for the migration.')}
                  </TextListItem>
                  <TextListItem>
                    {t(
                      '2. Map source datastores, storage domains, volume types, storage classes and networks to their respective target storage classes and networks.',
                    )}
                  </TextListItem>
                  <TextListItem>
                    {t(
                      '3. Create a migration plan and select VMs from the source provider for migration.',
                    )}
                  </TextListItem>
                  <TextListItem>{t('4. Run the migration plan.')}</TextListItem>
                </TextList>
              </TextContent>
            </Bullseye>
          </LevelItem>
        </Level>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <ProvidersAddButton
            testId="add-provider-button-empty-state"
            namespace={namespace}
            canCreate={canCreate}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default ProvidersEmptyState;
