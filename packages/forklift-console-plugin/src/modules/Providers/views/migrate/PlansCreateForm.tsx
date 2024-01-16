import React, { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Form, FormGroup, TextInput } from '@patternfly/react-core';

import { DetailsItem } from '../../utils';

import { PageAction, setPlanName } from './actions';
import { CreateVmMigrationPageState } from './reducer';

export const PlansCreateForm = ({
  state: { newPlan: plan, validation },
  dispatch,
}: {
  state: CreateVmMigrationPageState;
  dispatch: (action: PageAction<unknown, unknown>) => void;
}) => {
  const { t } = useForkliftTranslation();
  const [isNameEdited, setIsNameEdited] = useState(false);
  return (
    <DescriptionList
      className="forklift-create-provider-edit-section"
      columnModifier={{
        default: '1Col',
      }}
    >
      {isNameEdited ? (
        <Form>
          <FormGroup
            label={t('Plan name')}
            isRequired
            fieldId="planName"
            validated={validation.name}
          >
            <TextInput
              isRequired
              type="text"
              id="planName"
              value={plan.metadata.name}
              validated={validation.name}
              onChange={(value) => dispatch(setPlanName(value?.trim() ?? '', []))}
            />
          </FormGroup>
        </Form>
      ) : (
        <DetailsItem
          title={t('Plan name')}
          content={plan.metadata.name}
          onEdit={() => setIsNameEdited(true)}
        />
      )}
      <DetailsItem
        title={t('Source provider')}
        content={
          <ResourceLink
            name={plan?.spec?.provider?.source?.name}
            namespace={plan?.spec?.provider?.source?.namespace}
            groupVersionKind={ProviderModelGroupVersionKind}
          />
        }
      />
      <DetailsItem
        title={t('{{vmCount}} VMs selected ', { vmCount: plan.spec.vms.length })}
        content={''}
      />
    </DescriptionList>
  );
};
