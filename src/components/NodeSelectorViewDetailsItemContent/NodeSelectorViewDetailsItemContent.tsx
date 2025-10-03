import type { FC } from 'react';

import { StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import './NodeSelectorViewDetailsItemContent.scss';

type NodeSelectorViewDetailsItemContentProps = {
  labels: Record<string, string> | undefined;
};

const NodeSelectorViewDetailsItemContent: FC<NodeSelectorViewDetailsItemContentProps> = ({
  labels,
}) => {
  return (
    <div className="node-selector-view-details-item">
      {isEmpty(labels) ? (
        <span className="text-muted">{t('No node selectors defined')}</span>
      ) : (
        Object.entries(labels ?? {})?.map(([key]) => {
          const labelText = labels?.[key] ? `${key}=${labels[key]}` : key;

          return (
            <span key={key} className="co-text-node">
              <StackItem>{labelText},</StackItem>
            </span>
          );
        })
      )}
    </div>
  );
};

export default NodeSelectorViewDetailsItemContent;
