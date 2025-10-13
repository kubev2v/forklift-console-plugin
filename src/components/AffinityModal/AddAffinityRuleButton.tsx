import type { FC } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

type AddAffinityRuleButtonProps = {
  isLinkButton?: boolean;
  onAffinityClickAdd: () => void;
};

const AddAffinityRuleButton: FC<AddAffinityRuleButtonProps> = ({
  isLinkButton,
  onAffinityClickAdd,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <Button
      className={isLinkButton ? 'pf-m-link--align-left' : ''}
      data-testid="add-affinity-rule-button"
      icon={isLinkButton && <PlusCircleIcon />}
      onClick={onAffinityClickAdd}
      variant={isLinkButton ? ButtonVariant.link : ButtonVariant.secondary}
    >
      {t('Add affinity rule')}
    </Button>
  );
};

export default AddAffinityRuleButton;
