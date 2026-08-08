import { useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, Stack } from '@patternfly/react-core';
import { getPlanTimezone } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmTimezone } from './utils/utils';
import TimezoneDropdown from './TimezoneDropdown';

const EditTimezone: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const currentTimezone = getPlanTimezone(resource) ?? '';
  const [value, setValue] = useState<string>(currentTimezone);

  return (
    <ModalForm
      title={t('Edit timezone')}
      confirmLabel={t('Save timezone')}
      isDisabled={value === currentTimezone}
      onConfirm={async () => onConfirmTimezone({ newValue: value, resource })}
      testId="edit-timezone-modal"
      {...rest}
    >
      <Stack hasGutter>
        {t(
          'Set the timezone for all VMs in this plan. When set, this overrides any timezone detected from the source provider.',
        )}
        <Form>
          <FormGroupWithHelpText label={t('Timezone')}>
            <TimezoneDropdown value={value} onChange={setValue} />
          </FormGroupWithHelpText>
        </Form>
      </Stack>
    </ModalForm>
  );
};

export default EditTimezone;
