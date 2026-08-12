import type { FC } from 'react';

import { Popover, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type SelectedToggleProps = {
  selectedVmKeys: string[];
  setShowAll: (showAll: boolean) => void;
  showAll: boolean;
};

const SelectedToggle: FC<SelectedToggleProps> = ({ selectedVmKeys, setShowAll, showAll }) => {
  const { t } = useForkliftTranslation();

  const toggleGroup = (
    <ToggleGroup>
      <ToggleGroupItem
        data-testid="vm-selection-toggle-all"
        isSelected={showAll}
        onChange={() => {
          setShowAll(true);
        }}
        text={t('All')}
      />
      <ToggleGroupItem
        data-testid="vm-selection-toggle-selected"
        isDisabled={isEmpty(selectedVmKeys)}
        isSelected={!showAll}
        onChange={() => {
          setShowAll(false);
        }}
        text={t('Selected')}
      />
    </ToggleGroup>
  );

  return isEmpty(selectedVmKeys) ? (
    <Popover bodyContent={t('No VMs have been selected')} triggerAction="hover">
      <div>{toggleGroup}</div>
    </Popover>
  ) : (
    toggleGroup
  );
};

export default SelectedToggle;
