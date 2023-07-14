import React, { FC, ReactNode } from 'react';

import { ResourceStatus } from '@openshift-console/dynamic-plugin-sdk';
import { Split, SplitItem } from '@patternfly/react-core';

interface HeaderTitleProps {
  title: ReactNode;
  status?: ReactNode;
}

export const HeaderTitle: FC<HeaderTitleProps> = ({ title, status }) => {
  return (
    <div className="co-m-nav-title co-m-nav-title--detail forklift-page-headings">
      <span className="co-m-pane__heading">
        <h1 className="co-resource-item__resource-name">
          <Split hasGutter>
            <SplitItem>
              {title}
              {status && <ResourceStatus additionalClassNames="hidden-xs">{status}</ResourceStatus>}
            </SplitItem>
          </Split>
        </h1>
      </span>
    </div>
  );
};

export default HeaderTitle;
