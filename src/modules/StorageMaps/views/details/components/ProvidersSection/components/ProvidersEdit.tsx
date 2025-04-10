import type { FC, FormEvent, ReactNode } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormSelect, FormSelectOption } from '@patternfly/react-core';

export const ProvidersEdit: FC<ProvidersEditProps> = ({
  helpContent,
  invalidLabel,
  label,
  mode,
  onChange,
  placeHolderLabel,
  providers,
  selectedProviderName,
  setMode,
}) => {
  const ProviderOption = (provider, index) => (
    <FormSelectOption
      key={provider?.metadata?.name ?? index}
      value={provider?.metadata?.name}
      label={provider?.metadata?.name}
    />
  );

  const targetProvider = fineProvider({ name: selectedProviderName, providers });

  const validated = targetProvider !== undefined ? 'success' : 'error';
  const hasProviders = providers?.length > 0;

  if (mode === 'edit') {
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
            onChange={(event, value) => {
              onChange(value, event);
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
              setMode('edit');
            }
          : undefined
      }
      helpContent={helpContent}
      crumbs={['spec', 'providers']}
    />
  );
};

type ProvidersEditProps = {
  providers: V1beta1Provider[];
  selectedProviderName: string;
  onChange: (value: string, event: FormEvent<HTMLSelectElement>) => void;
  label: string;
  placeHolderLabel: string;
  invalidLabel: string;
  helpContent: ReactNode;
  mode: 'edit' | 'view';
  setMode: (mode: 'edit' | 'view') => void;
};

type FindProviderFunction = (args: {
  providers: V1beta1Provider[];
  name: string;
}) => V1beta1Provider;

const fineProvider: FindProviderFunction = ({ name, providers }) =>
  providers.find((provider) => provider.metadata.name === name);
