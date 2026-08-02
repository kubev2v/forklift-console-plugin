import { useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, Stack } from '@patternfly/react-core';
import { getPlanTimezone } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import TimezoneDropdown from './TimezoneDropdown';
import { onConfirmTimezone } from './utils/utils';

const EditTimezone: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<string>(getPlanTimezone(resource) ?? '');

  return (
    <ModalForm
      title={t('Edit VM timezone')}
      confirmLabel={t('Save timezone')}
      isDisabled={value === (getPlanTimezone(resource) ?? '')}
      onConfirm={async () => onConfirmTimezone({ newValue: value, resource })}
      testId="edit-timezone-modal"
      {...rest}
    >
      <Stack hasGutter>
        {t(
          'Set the timezone for all VMs in this plan. When set, this overrides any timezone detected from the source provider.',
        )}
        <Form>
          <FormGroupWithHelpText label={t('VM timezone')}>
            <TimezoneDropdown value={value} onChange={setValue} />
          </FormGroupWithHelpText>
        </Form>
      </Stack>
    </ModalForm>
  );
};

export default EditTimezone;
