import type { FC, Ref } from 'react';

import { MenuToggle, type MenuToggleElement, Truncate } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type SettingsSelectToggleProps = {
  isOpen: boolean;
  onToggleClick: () => void;
  selected: string | number;
  testId?: string;
  toggleRef: Ref<MenuToggleElement>;
};

const SettingsSelectToggle: FC<SettingsSelectToggleProps> = ({
  isOpen,
  onToggleClick,
  selected,
  testId,
  toggleRef,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <MenuToggle
      className="forklift-overview__settings-select"
      data-testid={testId}
      isExpanded={isOpen}
      onClick={onToggleClick}
      ref={toggleRef}
    >
      <Truncate content={String(selected) || t('Select an option')} />
    </MenuToggle>
  );
};

export default SettingsSelectToggle;
