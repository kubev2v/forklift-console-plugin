import { type FC, type ReactNode, useRef, useState } from 'react';

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

  const openDrawer = (content: ReactNode, title?: ReactNode) => {
    setDrawerContent(content);
    setDrawerTitle(title ?? null);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

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
    <DrawerContext.Provider value={{ closeDrawer, isOpen, openDrawer }}>
      <Drawer isExpanded={isOpen} onExpand={() => focusRef.current?.focus()} position="right">
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>{children}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </DrawerContext.Provider>
  );
};
