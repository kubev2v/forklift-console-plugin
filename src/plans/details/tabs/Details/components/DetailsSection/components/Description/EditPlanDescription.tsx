import { useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { getPlanDescription } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../../SettingsSection/utils/types';

import { onConfirmDescription } from './utils/utils';

const EditPlanDescription: OverlayComponent<EditPlanProps> = ({
  closeOverlay,
  resource,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<string | undefined>(getPlanDescription(resource));

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={async () => onConfirmDescription({ newValue: value, resource })}
      title={t('Edit description')}
      {...rest}
    >
      <Form>
        <FormGroup label={t('Description')}>
          <TextInput
            onChange={(_ev, newValue: string) => {
              setValue(newValue);
            }}
            value={value}
          />
        </FormGroup>
      </Form>
    </ModalForm>
  );
};

export default EditPlanDescription;
