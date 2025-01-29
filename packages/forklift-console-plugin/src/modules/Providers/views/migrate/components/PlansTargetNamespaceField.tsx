import React, { FC } from 'react';
import { FilterableSelect } from 'src/components';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils';

import { FormGroupWithHelpText, HelpIconPopover } from '@kubev2v/common';
import { Form, Stack, StackItem } from '@patternfly/react-core';

import { CreateVmMigrationPageState } from '../types';

interface PlansTargetNamespaceFieldProps {
  state: CreateVmMigrationPageState;
  onChangeTargetNamespace: (value: string) => void;
}

export const PlansTargetNamespaceField: FC<PlansTargetNamespaceFieldProps> = ({
  state,
  onChangeTargetNamespace,
}) => {
  const { t } = useForkliftTranslation();
  const {
    underConstruction: { plan },
    validation,
    calculatedOnce: { namespacesUsedBySelectedVms },
    existingResources: { targetNamespaces: availableTargetNamespaces },
    flow,
  } = state;

  return (
    <Form isWidthLimited>
      <FormGroupWithHelpText
        label={t('Target namespace')}
        isRequired
        id="targetNamespace"
        validated={validation.targetNamespace}
        placeholder={t('Select a namespace')}
        labelIcon={
          <HelpIconPopover header={t('Target namespace')}>
            <Stack hasGutter>
              <StackItem>
                <ForkliftTrans>
                  Namespaces, also known as projects, separate resources within clusters.
                </ForkliftTrans>
              </StackItem>

              <StackItem>
                <ForkliftTrans>
                  The target namespace is the namespace within your selected target provider that
                  your virtual machines will be migrated to. This is different from the namespace
                  that your migration plan will be created in and where your provider was created.
                </ForkliftTrans>
              </StackItem>
            </Stack>
          </HelpIconPopover>
        }
      >
        <FilterableSelect
          selectOptions={availableTargetNamespaces.map((targetNamespace) => ({
            itemId: targetNamespace?.name,
            isDisabled:
              namespacesUsedBySelectedVms.includes(targetNamespace?.name) &&
              plan.spec.provider?.destination?.name === plan.spec.provider.source.name,
            children: targetNamespace?.name,
          }))}
          value={plan.spec.targetNamespace}
          onSelect={(value) => onChangeTargetNamespace(value as string)}
          isDisabled={flow.editingDone}
          isScrollable
          canCreate
          createNewOptionLabel={t('Create new namespace:')}
        />
      </FormGroupWithHelpText>
    </Form>
  );
};
