import React, { createContext, useContext, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { type ActionService, ActionServiceProvider } from 'common/src/polyfills/sdk-shim';
import { useTranslation } from 'common/src/utils/i18n';

import { Dropdown, DropdownItem, DropdownToggle, KebabToggle } from '@patternfly/react-core';

export interface ActionContextProps {
  /**
   * The kind of toggle to use for the entity actions. Default: `'kebab'`
   */
  variant: 'kebab' | 'dropdown';

  /**
   * The set of the action ids to leave out of the entity actions. Default: `[]`
   */
  ignoreList: string[];
}

/**
 * It's not possible to pass directly parameters to the Action components -
 * we are limited to Action interface. However we can pass the parameters indirectly:
 * 1. via closure - works best for near constant props like "variant"
 * 2. via context - works better for frequently changing props i.e. "ignoreList"
 */
export const ActionContext: React.Context<ActionContextProps> = createContext({
  variant: 'kebab',
  ignoreList: [],
});

export interface EnhancedActionsComponentProps<T> {
  entity: T;
  ignoreList?: string[];
  namespace?: string;
}

/**
 * Create an `ActionContext` around an `ActionServiceProvider` extension at `contextId`
 * to render a set of actions for target entity `T`.  Each entity `T` will have actions
 * rendered individually by the `ActionsComponent` render prop.
 *
 * @param variant The kind of toggle to use for the entity actions
 * @param contextId The contextId of the `console.action/provider` extension to use
 */
export function withActionContext<T>(
  variant: 'kebab' | 'dropdown',
  contextId: string,
): React.ComponentType<EnhancedActionsComponentProps<T>> {
  const Enhanced = ({ entity, ignoreList = [], namespace }: EnhancedActionsComponentProps<T>) => {
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

/**
 * Render prop given to `ActionServiceProvider` by `withActionContext()`
 */
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
