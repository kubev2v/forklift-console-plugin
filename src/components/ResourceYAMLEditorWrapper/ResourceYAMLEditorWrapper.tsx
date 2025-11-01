import type { FC, PropsWithChildren } from 'react';

import './ResourceYAMLEditorWrapper.scss';

/**
 * Wrapper component that ensures YAML editors have minimum height on condensed pages
 */
export const ResourceYAMLEditorWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div className="resource-yaml-editor-wrapper">{children}</div>;
};
