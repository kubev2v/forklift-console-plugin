import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  Flex,
  Form,
  FormGroup,
  List,
  ListItem,
  Modal,
  ModalVariant,
  Popover,
  Radio,
  Stack,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { PlanHook } from './PlanHooksSection';

interface PlanAddHookModalProps {
  onClose: () => void;
  onSave: (instance: PlanHook) => void;
  SetHookBeingAdded: (instance: PlanHook) => void;
  hookBeingAdded: PlanHook;
}

const newHook: PlanHook = {
  step: 'PreHook',
  hook: {
    apiVersion: '',
    kind: '',
    metadata: '',
    spec: {
      playbook: '',
      image: 'quay.io/konveyor/hook-runner:latest',
    },
    status: '',
  },
};

export const PlanAddHookModal: React.FunctionComponent<PlanAddHookModalProps> = ({
  onClose,
  onSave,
  SetHookBeingAdded,
  hookBeingAdded = newHook,
}: PlanAddHookModalProps) => {
  const { t } = useForkliftTranslation();

  SetHookBeingAdded(newHook);
  const [isPostHook, toggleIsPostHook] = React.useReducer((isPostHook) => !isPostHook, false);
  const [isPlaybook, toggleIsPlaybook] = React.useReducer((isPlaybook) => !isPlaybook, false);

  const handleStepTypeChange = (type: string) => {
    if (hookBeingAdded.step === 'PostHook') {
      toggleIsPostHook();
    }
    hookBeingAdded.step = type === 'PreHook' ? 'PreHook' : 'PostHook';
  };

  const handleChange = (id, value) => {
    if (id !== 'hookImage') return;

    hookBeingAdded.hook.spec.image = value;
  };

  return (
    <React.Fragment>
      <Modal
        variant={ModalVariant.large}
        title={t('Add hook')}
        isOpen
        onClose={onClose}
        footer={
          <Stack hasGutter>
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
              <Button
                id="modal-confirm-button"
                key="confirm"
                variant="primary"
                onClick={() => onSave(hookBeingAdded)}
              >
                {t('Add hook')}
              </Button>
              <Button
                id="modal-cancel-button"
                key="cancel"
                variant="link"
                onClick={() => onClose()}
              >
                {t('Cancel')}
              </Button>
            </Flex>
          </Stack>
        }
      >
        <Form>
          <FormGroup label="Step when the hook will be run" isRequired fieldId="hook-step-select">
            <Radio
              name="stepType"
              label="Pre-migration"
              id="Pre-migration"
              isChecked={!isPostHook}
              onClick={() => handleStepTypeChange('PreHook')}
            />
            <Radio
              name="stepType"
              label="Post-migration"
              id="Post-migration"
              isChecked={isPostHook}
              onClick={() => handleStepTypeChange('PostHook')}
            />
          </FormGroup>
          <FormGroup
            isRequired
            label="Hook definition"
            fieldId="hook-definition"
            labelIcon={
              <Popover
                bodyContent={
                  <>
                    There are two options for adding a hook definition:
                    <List component="ol">
                      <ListItem>
                        Add an ansible playbook file to be run. A default hook runner image is
                        provided, or you may choose your own.
                      </ListItem>
                      <ListItem>
                        Specify only a custom image which will run your defined entrypoint when
                        loaded.
                      </ListItem>
                    </List>
                  </>
                }
              >
                <Button
                  variant="plain"
                  aria-label="More info for hook definition field"
                  onClick={(e) => e.preventDefault()}
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon />
                </Button>
              </Popover>
            }
          >
            <Radio
              id="hook-definition-ansible"
              name="hook-definition"
              label="Ansible playbook"
              isChecked={isPlaybook}
              onChange={(checked) => {
                if (checked) {
                  toggleIsPlaybook();
                }
              }}
              className={spacing.mbSm}
            />

            <Radio
              id="hook-definition-image"
              name="hook-definition"
              label="Custom container image"
              isChecked={!isPlaybook}
              onChange={(checked) => {
                if (checked) {
                  toggleIsPlaybook();
                }
              }}
              className={spacing.mbXs}
            />

            {!isPlaybook ? (
              <TextInput
                value={hookBeingAdded?.hook?.spec?.image || ''}
                label={null}
                isRequired
                type="text"
                id="hookImage"
                validated={hookBeingAdded?.hook?.spec?.image}
                onChange={(value) => handleChange('hookImage', value)}
              />
            ) : null}
          </FormGroup>
        </Form>
      </Modal>
    </React.Fragment>
  );
};
