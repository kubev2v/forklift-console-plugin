import type { FC, PropsWithChildren } from 'react';

import './ResourceYAMLEditorWrapper.scss';

/**
 * Wrapper component that lets YAML editors fill the remaining space below title and tabs.
 */
export const ResourceYAMLEditorWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div className="resource-yaml-editor-wrapper">{children}</div>;
};
