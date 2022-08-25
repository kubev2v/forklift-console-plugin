import * as React from 'react';
import * as yup from 'yup';
import { usePausedPollingEffect } from '@app/common/context';
import { playbookSchema } from '@app/queries';
import {
  getFormGroupProps,
  useFormField,
  useFormState,
  ValidatedTextInput,
} from '@migtools/lib-ui';
import {
  Modal,
  Stack,
  Flex,
  Button,
  Form,
  FormGroup,
  FileUpload,
  List,
  ListItem,
  Popover,
  Radio,
} from '@patternfly/react-core';
import { LoadingEmptyState } from '@app/common/components/LoadingEmptyState';
import { SimpleSelect, OptionWithValue } from '@app/common/components/SimpleSelect';
import { ConditionalTooltip } from '@app/common/components/ConditionalTooltip';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { HookStep, IHook } from '@app/queries/types';

const usePlanHookInstanceFormState = () => {
  const type = useFormField('playbook', yup.mixed<'playbook' | 'image'>().required());
  const imageSchema = yup.string().label('Custom container image');
  const requiredMessage = 'Hook definition is a required field';
  return useFormState({
    step: useFormField<HookStep | null>(
      null,
      yup.mixed<HookStep | null>().label('Step').required()
    ),
    type,
    playbook: useFormField(
      '',
      type.value === 'playbook' ? playbookSchema.required(requiredMessage) : playbookSchema
    ),
    image: useFormField(
      '',
      type.value === 'image' ? imageSchema.required(requiredMessage) : imageSchema
    ),
    prefilledFromHook: useFormField<IHook | null>(null, yup.mixed()),
  });
};

export type PlanHookInstanceFormState = ReturnType<typeof usePlanHookInstanceFormState>;
export type PlanHookInstance = PlanHookInstanceFormState['values'];

const useEditPlanHookInstancePrefillEffect = (
  form: PlanHookInstanceFormState,
  instanceBeingEdited: PlanHookInstance | null
) => {
  const [isStartedPrefilling, setIsStartedPrefilling] = React.useState(false);
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(!instanceBeingEdited);
  React.useEffect(() => {
    if (!isStartedPrefilling && instanceBeingEdited) {
      setIsStartedPrefilling(true);
      form.fields.type.prefill(instanceBeingEdited.type);
      form.fields.step.prefill(instanceBeingEdited.step);
      form.fields.playbook.prefill(instanceBeingEdited.playbook);
      if (instanceBeingEdited.type === 'image') {
        form.fields.image.prefill(instanceBeingEdited.image);
      }
      form.fields.prefilledFromHook.prefill(instanceBeingEdited.prefilledFromHook);
      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [isStartedPrefilling, form, instanceBeingEdited]);
  return { isDonePrefilling };
};

interface IPlanAddEditHookModalProps {
  onClose: () => void;
  onSave: (instance: PlanHookInstance) => void;
  instanceBeingEdited: PlanHookInstance | null;
  isWarmMigration: boolean;
  hasPreHook: boolean;
  hasPostHook: boolean;
}

export const PlanAddEditHookModal: React.FunctionComponent<IPlanAddEditHookModalProps> = ({
  onClose,
  onSave,
  instanceBeingEdited,
  isWarmMigration,
  hasPreHook,
  hasPostHook,
}: IPlanAddEditHookModalProps) => {
  usePausedPollingEffect();

  const instanceForm = usePlanHookInstanceFormState();

  const { isDonePrefilling } = useEditPlanHookInstancePrefillEffect(
    instanceForm,
    instanceBeingEdited
  );

  const migrationOrCutover = !isWarmMigration ? 'migration' : 'cutover';

  const preHookDisabled = hasPreHook && instanceBeingEdited?.step !== 'PreHook';
  const postHookDisabled = hasPostHook && instanceBeingEdited?.step !== 'PostHook';

  const stepOptions: OptionWithValue<HookStep>[] = [
    {
      toString: () => `Pre-${migrationOrCutover}`,
      value: 'PreHook',
      props: {
        isDisabled: preHookDisabled,
        className: preHookDisabled ? 'disabled-with-pointer-events' : '',
        children: (
          <ConditionalTooltip
            isTooltipEnabled={preHookDisabled}
            content={`Only one pre-${migrationOrCutover} hook is allowed.`}
            position="left"
          >
            <div>{`Pre-${migrationOrCutover}`}</div>
          </ConditionalTooltip>
        ),
      },
    },
    {
      toString: () => `Post-${migrationOrCutover}`,
      value: 'PostHook',
      props: {
        isDisabled: postHookDisabled,
        className: postHookDisabled ? 'disabled-with-pointer-events' : '',
        children: (
          <ConditionalTooltip
            isTooltipEnabled={postHookDisabled}
            content={`Only one post-${migrationOrCutover} hook is allowed.`}
            position="left"
          >
            <div>{`Post-${migrationOrCutover}`}</div>
          </ConditionalTooltip>
        ),
      },
    },
  ];

  // We don't need to persist the playbook filename, so it's not lifted to form state.
  const [playbookFilename, setPlaybookFilename] = React.useState('');

  return (
    <Modal
      className="AddEditHookModal"
      variant="medium"
      title={`${!instanceBeingEdited ? 'Add' : 'Edit'} hook`}
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              isDisabled={!instanceForm.isValid || (!instanceBeingEdited && !instanceForm.isDirty)}
              onClick={() => onSave(instanceForm.values)}
            >
              {!instanceBeingEdited ? 'Add' : 'Save'}
            </Button>
            <Button id="modal-cancel-button" key="cancel" variant="link" onClick={() => onClose()}>
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      {!isDonePrefilling ? (
        <LoadingEmptyState />
      ) : (
        <Form>
          <FormGroup
            label="Step when the hook will be run"
            isRequired
            fieldId="hook-step-select"
            {...getFormGroupProps(instanceForm.fields.step)}
          >
            <SimpleSelect
              id="hook-step-select"
              toggleId="hook-step-select-toggle"
              aria-label="Step when the hook will be run"
              options={stepOptions}
              value={[
                stepOptions.find((option) => option.value === instanceForm.fields.step.value),
              ]}
              onChange={(selection) =>
                instanceForm.fields.step.setValue((selection as OptionWithValue<HookStep>).value)
              }
              placeholderText="Select..."
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
                  <HelpIcon noVerticalAlign />
                </Button>
              </Popover>
            }
          >
            <Radio
              id="hook-definition-ansible"
              name="hook-definition"
              label="Ansible playbook"
              isChecked={instanceForm.values.type === 'playbook'}
              onChange={(checked) => {
                if (checked) {
                  instanceForm.fields.type.setValue('playbook');
                }
              }}
              className={spacing.mbSm}
            />
            {instanceForm.values.type === 'playbook' ? (
              <div className={`${spacing.mlLg} ${spacing.mbMd}`}>
                <FormGroup
                  label="Upload your Ansible playbook file or paste its contents below."
                  fieldId="playbook-yaml"
                  {...getFormGroupProps(instanceForm.fields.playbook)}
                >
                  <FileUpload
                    id="playbook-yaml"
                    type="text"
                    value={instanceForm.values.playbook}
                    filename={playbookFilename}
                    onChange={(value, filename) => {
                      instanceForm.fields.playbook.setValue(value as string);
                      instanceForm.fields.playbook.setIsTouched(true);
                      setPlaybookFilename(filename);
                    }}
                    onBlur={() => instanceForm.fields.playbook.setIsTouched(true)}
                    validated={instanceForm.fields.playbook.shouldShowError ? 'error' : 'default'}
                  />
                </FormGroup>
              </div>
            ) : null}
            <Radio
              id="hook-definition-image"
              name="hook-definition"
              label="Custom container image"
              isChecked={instanceForm.values.type === 'image'}
              onChange={(checked) => {
                if (checked) {
                  instanceForm.fields.type.setValue('image');
                }
              }}
              className={spacing.mbXs}
            />
            {instanceForm.values.type === 'image' ? (
              <ValidatedTextInput
                field={instanceForm.fields.image}
                label={null}
                isRequired
                fieldId="image"
                formGroupProps={{
                  className: spacing.mlLg,
                }}
              />
            ) : null}
          </FormGroup>
        </Form>
      )}
    </Modal>
  );
};
