import React, { createContext, useContext, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { type ActionService, ActionServiceProvider } from 'common/src/polyfills/sdk-shim';
import { useTranslation } from 'common/src/utils/i18n';

import { Dropdown, DropdownItem, DropdownToggle, KebabToggle } from '@patternfly/react-core';

interface ActionContextProps {
  /** The kind of toggle to use for the entity actions. Default: `'kebab'` */
  variant: 'kebab' | 'dropdown';

  /** The set of the action ids to leave out of the entity actions. Default: `[]` */
  ignoreList: string[];
}

/**
 * It is not possible to pass parameters directly to the `ActionServiceProvider`
 * render prop.  We are limited to params provided from the action hook's output
 * `ActionService` interface.  However, we can pass parameters to the render prop
 * indirectly using a closure or a context.  We use the context approach to avoid
 * any syntactic complexities from using closures.
 */
const ActionContext: React.Context<ActionContextProps> = createContext({
  variant: 'kebab',
  ignoreList: [],
});

export interface EnhancedActionsComponentProps<T> {
  /** Resource the actions will act upon. */
  resourceData: T;

  /** The resource's namespace. */
  namespace?: string;

  /** A list of actions to ignore and leave off the full set of actions for the entity. */
  ignoreList?: string[];
}

/**
 * Create an `ActionContext` provider around an `ActionServiceProvider` extension at
 * `contextId` to render a set of actions for target entity `T`.  Each entity `T` will
 * have actions rendered individually by the `ActionsComponent` render prop.
 *
 * @param variant The kind of toggle to use for the resourceData actions
 * @param contextId The contextId of the `console.action/provider` extension to use
 */
export function withActionContext<T>(
  variant: 'kebab' | 'dropdown',
  contextId: string,
): React.ComponentType<EnhancedActionsComponentProps<T>> {
  const Enhanced = ({
    resourceData,
    ignoreList = [],
    namespace,
  }: EnhancedActionsComponentProps<T>) => {
    const outerProviderData: ActionContextProps = useMemo(
      () => ({ variant, ignoreList: [...ignoreList] }),
      // check if data inside the array has changed
      [variant, ...ignoreList],
    );
    const innerProviderData = useMemo(
      () => ({ [contextId]: { resourceData, namespace } }),
      [contextId, resourceData, namespace],
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
const ActionsComponent = ({ actions }: ActionService): React.ReactNode => {
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
          .map(({ id, label, cta, disabled, disabledTooltip, tooltip }) => (
            <DropdownItem
              key={id}
              onClick={typeof cta === 'function' ? cta : () => cta.href && history.push(cta.href)}
              isAriaDisabled={disabled}
              tooltip={disabled ? disabledTooltip : tooltip}
            >
              {label}
            </DropdownItem>
          ))}
      />
    </>
  );
};
