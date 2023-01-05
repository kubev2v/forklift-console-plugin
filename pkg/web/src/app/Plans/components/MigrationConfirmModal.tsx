import * as React from 'react';
import { ConfirmModal, IConfirmModalProps } from '@app/common/components/ConfirmModal';
import { IPlan } from '@app/queries/types';
import { TextContent, Text } from '@patternfly/react-core';
import { useCreateMigrationMutation } from '@app/queries';

interface IMigrationConfirmModalProps
  extends Pick<IConfirmModalProps, 'isOpen' | 'toggleOpen' | 'mutateResult'> {
  plan: IPlan;
  action: 'start' | 'restart';
  createMigrationMutation: ReturnType<typeof useCreateMigrationMutation>;
}

export const MigrationConfirmModal: React.FunctionComponent<IMigrationConfirmModalProps> = ({
  isOpen,
  toggleOpen,
  createMigrationMutation,
  plan,
  action,
}: IMigrationConfirmModalProps) => {
  const verb = action === 'restart' ? 'Restart' : 'Start';
  const noun = plan.spec.warm ? 'incremental copies' : 'migration';

  return (
    <ConfirmModal
      isOpen={isOpen}
      position="top"
      toggleOpen={toggleOpen}
      mutateFn={() => createMigrationMutation.mutate(plan)}
      mutateResult={createMigrationMutation}
      title={`${verb} ${noun}?`}
      body={
        <TextContent>
          <Text>
            {verb} the {noun} for plan &quot;
            {plan.metadata.name}&quot;?
          </Text>
          <Text>
            {!plan.spec.warm
              ? 'VMs included in the migration plan will be shut down.'
              : 'VM data will be copied incrementally until cutover migration. To start cutover, click the Cutover button on the Plans page.'}
          </Text>
        </TextContent>
      }
      confirmButtonText={verb}
      errorText={`Cannot ${verb.toLowerCase()} ${noun}`}
    />
  );
};
