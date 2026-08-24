import { type FC, type ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import {
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';

import { DrawerContext } from './DrawerContext';

import './DrawerProvider.scss';

export const DrawerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<ReactNode>(null);
  const [drawerTitle, setDrawerTitle] = useState<ReactNode>(null);
  const focusRef = useRef<HTMLDivElement>(null);

  const openDrawer = useCallback((content: ReactNode, title?: ReactNode): void => {
    setDrawerContent(content);
    setDrawerTitle(title ?? null);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const drawerContextValue = useMemo(
    () => ({ closeDrawer, isOpen, openDrawer }),
    [closeDrawer, isOpen, openDrawer],
  );

  const panelContent = (
    <DrawerPanelContent>
      <DrawerPanelBody className="pf-v6-c-drawer__head drawer-head">
        <span ref={focusRef} tabIndex={isOpen ? 0 : -1}>
          {drawerTitle}
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={closeDrawer} />
        </DrawerActions>
      </DrawerPanelBody>
      <DrawerPanelBody>{drawerContent}</DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <DrawerContext.Provider value={drawerContextValue}>
      <Drawer isExpanded={isOpen} onExpand={() => focusRef.current?.focus()} position="right">
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>{children}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </DrawerContext.Provider>
  );
};
