import { useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { getPlanDescription } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../../SettingsSection/utils/types';

import { onConfirmDescription } from './utils/utils';

const EditPlanDescription: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<string | undefined>(getPlanDescription(resource));

  return (
    <ModalForm
      title={t('Edit description')}
      onConfirm={async () => onConfirmDescription({ newValue: value, resource })}
      {...rest}
    >
      <Form>
        <FormGroup label={t('Description')}>
          <TextInput
            value={value}
            onChange={(_ev, newValue: string) => {
              setValue(newValue);
            }}
          />
        </FormGroup>
      </Form>
    </ModalForm>
  );
};

export default EditPlanDescription;
