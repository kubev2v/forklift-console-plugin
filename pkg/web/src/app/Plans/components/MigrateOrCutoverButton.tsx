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
}

export const MigrateOrCutoverButton: React.FunctionComponent<IMigrateOrCutoverButtonProps> = ({
  plan,
  buttonType,
  isBeingStarted,
}: IMigrateOrCutoverButtonProps) => {
  const history = useHistory();
  const [isConfirmModalOpen, toggleConfirmModal] = React.useReducer((isOpen) => !isOpen, false);
  const onMigrationStarted = () => {
    toggleConfirmModal();
    history.push(`${PATH_PREFIX}/plans/${plan.metadata.name}`);
  };
  const createMigrationMutation = useCreateMigrationMutation(onMigrationStarted);
  const setCutoverMutation = useSetCutoverMutation(toggleConfirmModal);

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
