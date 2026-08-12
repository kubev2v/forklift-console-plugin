import { useState } from 'react';
import {
  OVA_APPLIANCE_MANAGEMENT_DESCRIPTION,
  OVA_APPLIANCE_MANAGEMENT_LABEL,
} from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Checkbox, Form, FormGroup } from '@patternfly/react-core';
import { isApplianceManagementEnabled } from '@utils/crds/common/selectors';

import onUpdateApplianceManagement from './onUpdateApplianceManagement';

export type EditApplianceManagementProps = {
  provider: V1beta1Provider;
};

const EditApplianceManagement: OverlayComponent<EditApplianceManagementProps> = ({
  closeOverlay,
  provider,
}) => {
  const { t } = useForkliftTranslation();

  const [enabled, setEnabled] = useState(isApplianceManagementEnabled(provider));

  const onSubmit = async (): Promise<V1beta1Provider> => {
    return onUpdateApplianceManagement(provider, enabled);
  };

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={onSubmit}
      title={t('Edit appliance management')}
    >
      <Form>
        <FormGroup fieldId="appliance-management">
          <Checkbox
            data-testid="edit-appliance-management-checkbox"
            description={OVA_APPLIANCE_MANAGEMENT_DESCRIPTION}
            id="appliance-management-checkbox"
            isChecked={enabled}
            label={OVA_APPLIANCE_MANAGEMENT_LABEL}
            name="appliance-management"
            onChange={(_event, checked) => {
              setEnabled(checked);
            }}
          />
        </FormGroup>
      </Form>
    </ModalForm>
  );
};

export default EditApplianceManagement;
