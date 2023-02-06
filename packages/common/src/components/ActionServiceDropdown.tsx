import React, { createContext, useContext, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { ActionService, ActionServiceProvider } from 'common/src/polyfills/sdk-shim';
import { useTranslation } from 'common/src/utils/i18n';

import { Dropdown, DropdownItem, DropdownToggle, KebabToggle } from '@patternfly/react-core';

/**
 * It's not possible to pass directly parameters to the Action components -
 * we are limted to Action interface. However we can pass the parameters indirectly:
 * 1. via clousure - works best for near constant props like "variant"
 * 2. via context - works better for frequently changing props i.e. "ignoreList"
 * @param variant drop down variant to be used - defaults to 'kebab'
 * @param ignoreList list of actions that should be ignored(filtered out). Main use case is to exlude primary actions.
 */
export const ActionContext = createContext({ variant: 'kebab', ignoreList: [] });

export interface EhancedActionsComponentProps<T> {
  entity: T;
  ignoreList?: string[];
  namespace?: string;
}

export function withActionContext<T>(
  variant: 'kebab' | 'dropdown',
  contextId: string,
): React.ComponentType<EhancedActionsComponentProps<T>> {
  const Enhanced = ({ entity, ignoreList = [], namespace }: EhancedActionsComponentProps<T>) => {
    const outerProviderData = useMemo(
      () => ({ variant, ignoreList: [...ignoreList] }),
      // check if data inside the array has changed
      [variant, ...ignoreList],
    );
    const innerProviderData = useMemo(
      () => ({ [contextId]: { entity, namespace } }),
      [contextId, entity, namespace],
    );
    return (
      <ActionContext.Provider value={outerProviderData}>
        <ActionServiceProvider context={innerProviderData}>
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
ActionsComponent.displayName = 'ActionsComponent';
