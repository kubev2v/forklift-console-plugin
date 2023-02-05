import * as React from 'react';
import { Button, TextContent, Modal, Text } from '@patternfly/react-core';
import {
  MustGatherContext,
  NotificationContext,
  MustGatherObjType,
} from 'legacy/src/common/context';
import { useMustGatherMutation } from 'legacy/src/queries';

export const MustGatherModal: React.FunctionComponent = () => {
  const { activeMustGather, withNs, setMustGatherModalOpen, mustGatherModalOpen } =
    React.useContext(MustGatherContext);
  const { pushNotification } = React.useContext(NotificationContext);

  const handleMustGatherSuccess = () => {
    if (activeMustGather) {
      pushNotification({
        title: `Started must gather for ${activeMustGather.displayName}`,
        message: '',
        key: activeMustGather.displayName,
        variant: 'info',
        actionClose: true,
        timeout: 4000,
      });
    }
  };

  const handleMustGatherError = () => {
    if (activeMustGather) {
      pushNotification({
        title: `Cannot run must gather for ${activeMustGather.displayName}`,
        message: '',
        key: activeMustGather.displayName,
        variant: 'danger',
        actionClose: true,
      });
    }
  };

  const registerMustGather = useMustGatherMutation(
    'must-gather',
    handleMustGatherSuccess,
    handleMustGatherError
  );

  const handleMustGatherRequest = ({ displayName, type }: MustGatherObjType) => {
    const namespacedName = withNs(displayName, type);
    registerMustGather.mutate({
      'custom-name': namespacedName,
      command:
        type === 'plan'
          ? `PLAN=${displayName} /usr/bin/targeted`
          : `VM=${displayName} /usr/bin/targeted`,
    });
    setMustGatherModalOpen(false);
  };

  return (
    <Modal
      variant="medium"
      title="Get logs"
      isOpen={mustGatherModalOpen}
      onClose={() => {
        setMustGatherModalOpen(false);
      }}
      actions={[
        <Button
          id="modal-confirm-button"
          key="confirm"
          variant="primary"
          onClick={() => {
            activeMustGather && handleMustGatherRequest(activeMustGather);
          }}
        >
          Get logs
        </Button>,
        <Button
          id="modal-cancel-button"
          key="cancel"
          variant="link"
          onClick={() => {
            setMustGatherModalOpen(false);
          }}
        >
          Cancel
        </Button>,
      ]}
    >
      <TextContent>
        <Text component="p">
          The migration logs will be consolidated into a single archive file named{' '}
          <strong>
            must-gather-{activeMustGather?.type}_{activeMustGather?.displayName}.tar.gz
          </strong>
          .
        </Text>
        <Text component="p">
          The log collection process can take several minutes. You will be notified when the process
          is complete and the tar archive file is ready to download.
        </Text>
      </TextContent>
    </Modal>
  );
};
