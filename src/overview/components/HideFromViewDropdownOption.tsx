import { DropdownItem } from '@patternfly/react-core';
import { t } from '@utils/i18n';

const HideFromViewDropdownOption = ({ onHide }: { onHide: () => void }) => {
  const hasHideAction = Boolean(onHide);

  return hasHideAction ? (
    <DropdownItem
      value={0}
      key="action"
      component="button"
      description={t(
        "You can always bring this welcome card back into view by clicking 'Show the welcome card' in the page heading.",
      )}
      onClick={onHide}
      data-testid="hide"
      style={{ fontWeight: 'bold', whiteSpace: 'pre-wrap', width: 280 }}
    >
      {t('Hide from view')}
    </DropdownItem>
  ) : (
    <DropdownItem />
  );
};

export default HideFromViewDropdownOption;
