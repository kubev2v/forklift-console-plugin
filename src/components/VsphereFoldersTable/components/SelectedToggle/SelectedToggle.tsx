import type { FC } from 'react';

import { Popover, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type SelectedToggleProps = {
  showAll: boolean;
  setShowAll: (showAll: boolean) => void;
  selectedVmKeys: string[];
};

const SelectedToggle: FC<SelectedToggleProps> = ({ selectedVmKeys, setShowAll, showAll }) => {
  const { t } = useForkliftTranslation();

  const toggleGroup = (
    <ToggleGroup>
      <ToggleGroupItem
        text={t('All')}
        isSelected={showAll}
        onChange={() => {
          setShowAll(true);
        }}
      />
      <ToggleGroupItem
        text={t('Selected')}
        isSelected={!showAll}
        onChange={() => {
          setShowAll(false);
        }}
        isDisabled={isEmpty(selectedVmKeys)}
      />
    </ToggleGroup>
  );

  return isEmpty(selectedVmKeys) ? (
    <Popover triggerAction="hover" bodyContent={t('No VMs have been selected')}>
      <div>{toggleGroup}</div>
    </Popover>
  ) : (
    toggleGroup
  );
};

export default SelectedToggle;
