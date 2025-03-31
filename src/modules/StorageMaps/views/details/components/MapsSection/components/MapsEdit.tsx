import React, { type ReactNode, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { DetailsItem } from 'src/modules/Providers/utils';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormSelect, FormSelectOption } from '@patternfly/react-core';

export const MapsEdit: React.FC<MapsEditProps> = ({
  helpContent,
  invalidLabel,
  label,
  mode,
  onChange,
  placeHolderLabel,
  providers,
  selectedProviderName,
}) => {
  const [isEdit, setEdit] = useState(mode === 'edit');

  const ProviderOption = (provider, index) => (
    <FormSelectOption
      key={provider?.metadata?.name || index}
      value={provider?.metadata?.name}
      label={provider?.metadata?.name}
    />
  );

  const targetProvider = fineProvider({ name: selectedProviderName, providers });

  const validated = targetProvider !== undefined ? 'success' : 'error';
  const hasProviders = providers?.length > 0;

  if (isEdit) {
    return (
      <Form isWidthLimited>
        <FormGroupWithHelpText
          label={label}
          isRequired
          fieldId="targetProvider"
          validated={validated}
          helperTextInvalid={invalidLabel}
        >
          <FormSelect
            value={selectedProviderName}
            onChange={(e, v) => {
              onChange(v, e);
            }}
            id="targetProvider"
            isDisabled={!hasProviders}
            validated={validated}
          >
            {[
              <FormSelectOption
                key="placeholder"
                value={''}
                label={placeHolderLabel}
                isPlaceholder
                isDisabled
              />,
              ...providers.map(ProviderOption),
            ]}
          </FormSelect>
        </FormGroupWithHelpText>
      </Form>
    );
  }
  return (
    <DetailsItem
      title={label}
      content={
        <ResourceLink
          inline
          name={selectedProviderName}
          namespace={targetProvider?.metadata?.namespace}
          groupVersionKind={ProviderModelGroupVersionKind}
          linkTo={targetProvider !== undefined}
        />
      }
      onEdit={
        hasProviders
          ? () => {
              setEdit(true);
            }
          : undefined
      }
      helpContent={helpContent}
      crumbs={['spec', 'providers']}
    />
  );
};

export type MapsEditProps = {
  providers: V1beta1Provider[];
  selectedProviderName: string;
  onChange: (value: string, event: React.FormEvent<HTMLSelectElement>) => void;
  label: string;
  placeHolderLabel: string;
  invalidLabel: string;
  helpContent: ReactNode;
  mode: 'edit' | 'view';
};

type FindProviderFunction = (args: {
  providers: V1beta1Provider[];
  name: string;
}) => V1beta1Provider;

const fineProvider: FindProviderFunction = ({ name, providers }) =>
  providers.find((p) => p.metadata.name === name);
