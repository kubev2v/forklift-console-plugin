import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup, Stack, Flex } from '@patternfly/react-core';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  ValidatedTextInput,
  ValidatedPasswordInput,
} from '@migtools/lib-ui';

import { SimpleSelect, OptionWithValue } from '@app/common/components/SimpleSelect';
import { IHost, IHostConfig, IHostNetworkAdapter, IVMwareProvider } from '@app/queries/types';

import {
  formatHostNetworkAdapter,
  isManagementNetworkSelected,
  usePrefillHostConfigEffect,
} from './helpers';
import { useConfigureHostsMutation } from '@app/queries';
import { QuerySpinnerMode, ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { LoadingEmptyState } from '@app/common/components/LoadingEmptyState';
import { ConditionalTooltip } from '@app/common/components/ConditionalTooltip';

interface ISelectNetworkModalProps {
  selectedHosts: IHost[];
  hostConfigs: IHostConfig[];
  provider: IVMwareProvider;
  commonNetworkAdapters: IHostNetworkAdapter[];
  onClose: () => void;
}

const useSelectNetworkFormState = (selectedHosts: IHost[]) => {
  const selectedNetworkAdapterField = useFormField<IHostNetworkAdapter | null>(
    null,
    yup.mixed<IHostNetworkAdapter>().label('Host network').required()
  );
  const isMgmtSelected = isManagementNetworkSelected(
    selectedHosts,
    selectedNetworkAdapterField.value
  );
  const usernameSchema = yup.string().max(320).label('ESXi host admin username');
  const passwordSchema = yup.string().max(256).label('ESXi host admin password');
  return useFormState({
    selectedNetworkAdapter: selectedNetworkAdapterField,
    adminUsername: useFormField('', !isMgmtSelected ? usernameSchema.required() : usernameSchema),
    adminPassword: useFormField('', !isMgmtSelected ? passwordSchema.required() : passwordSchema),
  });
};
export type SelectNetworkFormState = ReturnType<typeof useSelectNetworkFormState>;
export type SelectNetworkFormValues = SelectNetworkFormState['values'];

export const SelectNetworkModal: React.FunctionComponent<ISelectNetworkModalProps> = ({
  selectedHosts,
  hostConfigs,
  provider,
  commonNetworkAdapters,
  onClose,
}: ISelectNetworkModalProps) => {
  const configureHostMutation = useConfigureHostsMutation(
    provider,
    selectedHosts,
    hostConfigs,
    provider.namespace,
    onClose
  );

  const form = useSelectNetworkFormState(selectedHosts);
  const { isDonePrefilling } = usePrefillHostConfigEffect(
    form,
    selectedHosts,
    hostConfigs,
    provider
  );

  const networkOptions = commonNetworkAdapters.map((networkAdapter) => ({
    toString: () => formatHostNetworkAdapter(networkAdapter),
    value: networkAdapter,
    props: { description: `${networkAdapter.linkSpeed} Mbps; MTU: ${networkAdapter.mtu}` },
  }));

  const isMgmtSelected = isManagementNetworkSelected(
    selectedHosts,
    form.values.selectedNetworkAdapter
  );

  return (
    <Modal
      className="selectNetworkModal"
      variant="small"
      title="Select migration network"
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <ResolvedQuery
            result={configureHostMutation}
            errorTitle="Cannot configure hosts"
            spinnerMode={QuerySpinnerMode.Inline}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              isDisabled={!form.isDirty || !form.isValid || configureHostMutation.isLoading}
              onClick={() => {
                if (form.isValid) {
                  configureHostMutation.mutate(form.values);
                }
              }}
            >
              Save
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={onClose}
              isDisabled={configureHostMutation.isLoading}
            >
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
            label="Network"
            isRequired
            fieldId="network"
            validated={form.fields.selectedNetworkAdapter.shouldShowError ? 'error' : 'default'}
            {...getFormGroupProps(form.fields.selectedNetworkAdapter)}
          >
            <SimpleSelect
              id="network"
              toggleId="network-select-toggle"
              aria-label="Network"
              options={networkOptions}
              value={[
                networkOptions.find(
                  (option) =>
                    option.value.ipAddress === form.values.selectedNetworkAdapter?.ipAddress
                ),
              ]}
              onChange={(selection) =>
                form.fields.selectedNetworkAdapter.setValue(
                  (selection as OptionWithValue<IHostNetworkAdapter>).value
                )
              }
              placeholderText="Select a network..."
            />
          </FormGroup>

          <ConditionalTooltip
            isTooltipEnabled={isMgmtSelected}
            content="Credentials are not needed when selecting the provider’s default management network."
            position="left"
          >
            <ValidatedTextInput
              field={form.fields.adminUsername}
              isRequired
              fieldId="admin-username"
              inputProps={isMgmtSelected ? { isDisabled: true, value: '' } : {}}
            />
          </ConditionalTooltip>
          <ConditionalTooltip
            isTooltipEnabled={isMgmtSelected}
            content="Credentials are not needed when selecting the provider’s default management network."
            position="left"
          >
            <ValidatedPasswordInput
              field={form.fields.adminPassword}
              isRequired
              fieldId="admin-password"
              inputProps={isMgmtSelected ? { isDisabled: true, value: '' } : {}}
            />
          </ConditionalTooltip>
        </Form>
      )}
    </Modal>
  );
};
