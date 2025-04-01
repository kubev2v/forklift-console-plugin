import React, { FC, ReactNode } from 'react';

import { ResourceStatus } from '@openshift-console/dynamic-plugin-sdk';
import { Split, SplitItem } from '@patternfly/react-core';

interface HeaderTitleProps {
  title: ReactNode;
  status?: ReactNode;
  badge?: React.ReactNode;
}

const HeaderTitle: FC<HeaderTitleProps> = ({ title, status, badge }) => {
  return (
    <div className="co-m-nav-title co-m-nav-title--detail forklift-page-headings">
      <span className="                                                                                                                             ">
        <h1 className="co-resource-item__resource-name">
          <Split hasGutter style={{ alignItems: 'baseline' }}>
            <SplitItem isFilled>
              {title}
              {status && <ResourceStatus additionalClassNames="hidden-xs">{status}</ResourceStatus>}
            </SplitItem>
            {badge && (
              <SplitItem>
                {<span className="forklift-welcome-header-badge">{badge}</span>}
              </SplitItem>
            )}
          </Split>
        </h1>
      </span>
    </div>
  );
};

export default HeaderTitle;
