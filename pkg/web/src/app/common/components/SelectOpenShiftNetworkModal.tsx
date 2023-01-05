import * as React from 'react';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  Stack,
  Flex,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { useFormState, useFormField, getFormGroupProps } from '@migtools/lib-ui';

import { SimpleSelect, OptionWithValue } from '@app/common/components/SimpleSelect';
import {
  IOpenShiftNetwork,
  IOpenShiftProvider,
  IProviderObject,
  POD_NETWORK,
} from '@app/queries/types';
import { IProviderMigrationNetworkMutationVars } from '@app/queries/providers';

import { UseMutationResult } from 'react-query';
import { IKubeResponse, KubeClientError } from '@app/client/types';
import { QuerySpinnerMode, ResolvedQuery } from './ResolvedQuery';
import { useOpenShiftNetworksQuery } from '@app/queries';
import { isSameResource } from '@app/queries/helpers';
import { getUniqueItemsByName } from '../helpers';

interface ISelectOpenShiftNetworkModalProps {
  targetProvider: IOpenShiftProvider | null;
  targetNamespace: string | null;
  initialSelectedNetwork: string | null;
  instructions: string;
  onClose: () => void;
  onSubmit: (network: IOpenShiftNetwork | null) => void;
  mutationResult?: UseMutationResult<
    IKubeResponse<IProviderObject>,
    KubeClientError,
    IProviderMigrationNetworkMutationVars,
    unknown
  >;
}

const useSelectNetworkFormState = (initialSelectedNetwork: string | null) =>
  useFormState({
    selectedNetworkName: useFormField<string | null>(
      initialSelectedNetwork,
      yup.string().label('Migration network').required()
    ),
  });

export const SelectOpenShiftNetworkModal: React.FunctionComponent<
  ISelectOpenShiftNetworkModalProps
> = ({
  targetProvider,
  targetNamespace,
  initialSelectedNetwork,
  instructions,
  onClose,
  onSubmit,
  mutationResult,
}: ISelectOpenShiftNetworkModalProps) => {
  const form = useSelectNetworkFormState(initialSelectedNetwork);
  const networksQuery = useOpenShiftNetworksQuery(targetProvider);
  let networksInNamespace = networksQuery.data || [];
  if (targetNamespace) {
    networksInNamespace = networksInNamespace.filter(
      (network) => network.namespace === targetNamespace
    );
  }
  const networks = [POD_NETWORK, ...getUniqueItemsByName(networksInNamespace)];
  const networkOptions = networks.map((network) => ({
    toString: () => network.name,
    value: network,
  }));

  let selectedNetworkOption: OptionWithValue<IOpenShiftNetwork> | undefined = networkOptions[0]; // Pod network
  if (form.values.selectedNetworkName) {
    selectedNetworkOption = networkOptions.find(
      (option) => option.value.name === form.values.selectedNetworkName
    );
  }

  return (
    <Modal
      className="SelectOpenShiftNetworkModal"
      variant="small"
      position="top"
      title="Select migration network"
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          {mutationResult ? (
            <ResolvedQuery
              result={mutationResult}
              errorTitle="Cannot set migration network"
              spinnerMode={QuerySpinnerMode.Inline}
            />
          ) : null}
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              isDisabled={!form.isDirty || !form.isValid || mutationResult?.isLoading}
              onClick={() => {
                const isPodNetwork = isSameResource(selectedNetworkOption?.value, POD_NETWORK);
                onSubmit((!isPodNetwork && selectedNetworkOption?.value) || null);
              }}
            >
              Select
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={onClose}
              isDisabled={mutationResult?.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <ResolvedQuery result={networksQuery} errorTitle="Cannot load networks">
        <Form>
          <TextContent>
            <Text component="p">{instructions}</Text>
          </TextContent>
          <FormGroup
            isRequired
            fieldId="network"
            validated={form.fields.selectedNetworkName.shouldShowError ? 'error' : 'default'}
            {...getFormGroupProps(form.fields.selectedNetworkName)}
          >
            <SimpleSelect
              id="network"
              aria-label="Migration network"
              toggleId="network-select-toggle"
              options={networkOptions}
              value={[selectedNetworkOption]}
              onChange={(selection) =>
                form.fields.selectedNetworkName.setValue(
                  (selection as OptionWithValue<IOpenShiftNetwork>).value.name
                )
              }
              placeholderText="Select a network..."
              menuAppendTo="parent"
              maxHeight="40vh"
            />
          </FormGroup>
        </Form>
      </ResolvedQuery>
    </Modal>
  );
};
