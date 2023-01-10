import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Spinner } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useCreateMigrationMutation, useSetCutoverMutation } from '@app/queries';
import { IPlan } from '@app/queries/types';
import { PlanActionButtonType } from './PlansTable';
import { MigrationConfirmModal } from './MigrationConfirmModal';
import { CutoverConfirmModal } from './CutoverConfirmModal';
import { PATH_PREFIX } from '@app/common/constants';

interface IMigrateOrCutoverButtonProps {
  plan: IPlan;
  buttonType: PlanActionButtonType;
  isBeingStarted: boolean;
  currentNamespace?: string;
}

export const MigrateOrCutoverButton: React.FunctionComponent<IMigrateOrCutoverButtonProps> = ({
  plan,
  buttonType,
  isBeingStarted,
  currentNamespace,
}: IMigrateOrCutoverButtonProps) => {
  const history = useHistory();
  const [isConfirmModalOpen, toggleConfirmModal] = React.useReducer((isOpen) => !isOpen, false);
  const onMigrationStarted = () => {
    toggleConfirmModal();
    history.push(
      currentNamespace
        ? `${PATH_PREFIX}/plans/ns/${currentNamespace}/${plan.metadata.name}`
        : `${PATH_PREFIX}/plans/${plan.metadata.name}`
    );
  };
  const createMigrationMutation = useCreateMigrationMutation(
    plan.metadata.namespace,
    onMigrationStarted
  );
  const setCutoverMutation = useSetCutoverMutation(plan.metadata.namespace, toggleConfirmModal);

  return (
    <>
      {isBeingStarted ? (
        <Spinner size="md" className={spacing.mxLg} />
      ) : (
        <Button variant="secondary" onClick={toggleConfirmModal}>
          {buttonType}
        </Button>
      )}
      {isConfirmModalOpen ? (
        buttonType === 'Start' ? (
          <MigrationConfirmModal
            isOpen
            toggleOpen={toggleConfirmModal}
            createMigrationMutation={createMigrationMutation}
            plan={plan}
            action="start"
          />
        ) : buttonType === 'Cutover' ? (
          <CutoverConfirmModal
            isOpen
            toggleOpen={toggleConfirmModal}
            setCutoverMutation={setCutoverMutation}
            plan={plan}
          />
        ) : null
      ) : null}
    </>
  );
};
