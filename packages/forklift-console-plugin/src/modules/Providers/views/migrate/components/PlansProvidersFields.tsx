import React, { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { isEmpty, useForkliftTranslation } from 'src/utils';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { ProviderModelGroupVersionKind } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormSelect, FormSelectOption } from '@patternfly/react-core';

import { DetailsItem, getIsTarget } from '../../../utils';
import { CreateVmMigrationPageState } from '../types';

interface PlansProvidersFieldsProps {
  state: CreateVmMigrationPageState;
  onChangeTargetProvider: (value: string, event: React.FormEvent<HTMLSelectElement>) => void;
}

export const PlansProvidersFields: FC<PlansProvidersFieldsProps> = ({
  onChangeTargetProvider,
  state,
}) => {
  const { t } = useForkliftTranslation();
  const {
    underConstruction: { plan },
    validation,
    existingResources: { providers: availableProviders },
    flow,
  } = state;
  return (
    <>
      <SectionHeading
        text={t('Source provider')}
        className="forklift--create-vm-migration-plan--section-header"
      />

      <DetailsItem
        title={t('Source provider')}
        content={
          <ResourceLink
            name={plan.spec.provider?.source?.name}
            namespace={plan.spec.provider?.source?.namespace}
            groupVersionKind={ProviderModelGroupVersionKind}
          />
        }
      />

      <SectionHeading
        text={t('Target provider')}
        className="forklift--create-vm-migration-plan--section-header"
      />

      <Form isWidthLimited>
        <FormGroupWithHelpText
          label={t('Target provider')}
          isRequired
          fieldId="targetProvider"
          validated={validation.targetProvider}
          helperTextInvalid={
            isEmpty(availableProviders.filter(getIsTarget))
              ? t('No provider is available')
              : t('The chosen provider is no longer available.')
          }
        >
          <FormSelect
            value={plan.spec.provider?.destination?.name}
            onChange={(e, v) => onChangeTargetProvider(v, e)}
            id="targetProvider"
            isDisabled={flow.editingDone}
          >
            {[
              <FormSelectOption
                key="placeholder"
                value={''}
                label={t('Select a provider')}
                isPlaceholder
                isDisabled
              />,
              ...availableProviders
                .filter(getIsTarget)
                .map((provider, index) => (
                  <FormSelectOption
                    key={provider?.metadata?.name || index}
                    value={provider?.metadata?.name}
                    label={provider?.metadata?.name ?? provider?.metadata?.uid ?? String(index)}
                  />
                )),
            ]}
          </FormSelect>
        </FormGroupWithHelpText>
      </Form>
    </>
  );
};
