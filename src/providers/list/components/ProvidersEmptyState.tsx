import type { FC } from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  Bullseye,
  Content,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Level,
  LevelItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import ProvidersAddButton from './ProvidersAddButton';

type ProvidersEmptyStateProps = {
  canCreate?: boolean;
  namespace?: string;
};

const ProvidersEmptyState: FC<ProvidersEmptyStateProps> = ({ canCreate, namespace }) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState
      headingLevel="h4"
      icon={PlusCircleIcon}
      titleText={
        namespace ? (
          <ForkliftTrans>
            No providers found in project <strong>{namespace}</strong>
          </ForkliftTrans>
        ) : (
          t('No providers found')
        )
      }
    >
      <EmptyStateBody>
        <Level hasGutter>
          <LevelItem>
            <Bullseye>
              <Content>
                <Content component="p">
                  <ForkliftTrans>
                    Migrating virtualization workloads is a multi-step process.
                  </ForkliftTrans>
                </Content>
                <Content component="ul" isPlainList>
                  <Content component="li">
                    {t('1. Add source and target providers for the migration.')}
                  </Content>
                  <Content component="li">
                    {t(
                      '2. Map source datastores, storage domains, volume types, storage classes and networks to their respective target storage classes and networks.',
                    )}
                  </Content>
                  <Content component="li">
                    {t(
                      '3. Create a migration plan and select VMs from the source provider for migration.',
                    )}
                  </Content>
                  <Content component="li">{t('4. Run the migration plan.')}</Content>
                </Content>
              </Content>
            </Bullseye>
          </LevelItem>
        </Level>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <ProvidersAddButton
            canCreate={canCreate}
            namespace={namespace}
            testId="add-provider-button-empty-state"
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default ProvidersEmptyState;
