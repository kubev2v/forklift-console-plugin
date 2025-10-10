import type { FC, ReactNode } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import Select from 'src/components/common/Select';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Form } from '@patternfly/react-core';

type FindProviderFunction = (args: {
  providers: V1beta1Provider[];
  name: string;
}) => V1beta1Provider | undefined;

const findProvider: FindProviderFunction = ({ name, providers }) =>
  providers.find((provider) => provider.metadata?.name === name);

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
  const targetProvider = findProvider({ name: selectedProviderName, providers });

  const validated = targetProvider ? 'success' : 'error';
  const hasProviders = providers?.length > 0;

  const providerOptions = [
    { disabled: true, label: placeHolderLabel, value: '' },
    ...providers.map((provider) => ({
      label: provider?.metadata?.name ?? '',
      value: provider?.metadata?.name ?? '',
    })),
  ];

  if (mode === 'edit') {
    return (
      <Form isWidthLimited>
        <FormGroupWithHelpText
          helperText={helpContent}
          label={label}
          isRequired
          fieldId="targetProvider"
          validated={validated}
          helperTextInvalid={invalidLabel}
        >
          <Select
            id="targetProvider"
            value={selectedProviderName}
            options={providerOptions}
            placeholder={placeHolderLabel}
            isDisabled={!hasProviders}
            onSelect={(event, value) => {
              onChange(value, event);
            }}
          />
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
          linkTo={Boolean(targetProvider)}
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
  helpContent: ReactNode;
  invalidLabel: string;
  label: string;
  mode: 'edit' | 'view';
  onChange: (value: string | number | undefined, event: React.MouseEvent | undefined) => void;
  placeHolderLabel: string;
  providers: V1beta1Provider[];
  selectedProviderName: string;
  setMode: (mode: 'edit' | 'view') => void;
};
