import React, { createContext, useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from 'src/utils/i18n';

import { ActionService, ActionServiceProvider } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownToggle, KebabToggle } from '@patternfly/react-core';

/**
 * It's not possible to pass directly parameters to the Action components -
 * we are limted to Action interface. However we can pass the parameters indirectly:
 * 1. via clousure - works best for near constant props like "variant"
 * 2. via context - works better for frequently changing props i.e. "ignoreList"
 */
export const ActionContext = createContext({ variant: 'kebab', ignoreList: [] });

export function withActionContext<T>(variant: 'kebab' | 'dropdown', contextId: string) {
  const Enhanced = ({ entity, ignoreList = [] }: { entity: T; ignoreList?: string[] }) => {
    return (
      <ActionContext.Provider value={{ variant, ignoreList }}>
        <ActionServiceProvider context={{ [contextId]: entity }}>
          {ActionsComponent}
        </ActionServiceProvider>
      </ActionContext.Provider>
    );
  };
  return Enhanced;
}

const ActionsComponent = ({ actions }: ActionService) => {
  const { variant, ignoreList = [] } = useContext(ActionContext);
  const { t } = useTranslation();
  const history = useHistory();
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
        dropdownItems={actions
          .filter(({ id }) => !ignoreList?.includes(id))
          .map(({ id, label, cta, disabled, disabledTooltip }) => (
            <DropdownItem
              key={id}
              onClick={typeof cta === 'function' ? cta : () => cta.href && history.push(cta.href)}
              isAriaDisabled={disabled}
              tooltip={disabledTooltip}
            >
              {label}
            </DropdownItem>
          ))}
      />
    </>
  );
};
