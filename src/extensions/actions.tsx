import React, { useState } from 'react';
import { useTranslation } from 'src/internal/i18n';

import { ActionService } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownToggle, KebabToggle } from '@patternfly/react-core';

export const createActions = (variant: 'kebab' | 'dropdown') =>
  function GenericActions({ actions }: ActionService) {
    const { t } = useTranslation();
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const isPlain = variant === 'kebab';
    const toggle =
      variant === 'kebab' ? (
        <KebabToggle onToggle={setIsActionMenuOpen} />
      ) : (
        <DropdownToggle onToggle={setIsActionMenuOpen}>{t('Actions')}</DropdownToggle>
      );
    return (
      <>
        <Dropdown
          position="right"
          onSelect={() => setIsActionMenuOpen(!isActionMenuOpen)}
          toggle={toggle}
          isOpen={isActionMenuOpen}
          isPlain={isPlain}
          dropdownItems={actions.map(({ id, label, cta }) => (
            <DropdownItem key={id} onClick={typeof cta === 'function' ? cta : () => undefined}>
              {label}
            </DropdownItem>
          ))}
        />
      </>
    );
  };
