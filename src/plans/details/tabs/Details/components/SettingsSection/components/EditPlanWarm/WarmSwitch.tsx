import type { ModalInputComponentType } from 'src/modules/Providers/modals/EditModal/types';

import { Switch } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const WarmSwitch: ModalInputComponentType = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();
  return (
    <Switch
      label={t(
        'Warm migration, most of the data is copied during the precopy stage while the source virtual machines (VMs) are running.',
      )}
      labelOff={t(
        'Cold migration, the source virtual machines are shut down while the data is copied.',
      )}
      isChecked={value === 'true'}
      onChange={(_, checked) => {
        onChange(checked ? 'true' : 'false');
      }}
    />
  );
};

export default WarmSwitch;
