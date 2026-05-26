import type { FC } from 'react';

import { Label, StackItem } from '@patternfly/react-core';
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
        <Label isCompact color="grey">
          {t('No node selectors defined')}
        </Label>
      ) : (
        Object.entries(labels ?? {}).map(([key], index, entries) => {
          const labelText = labels?.[key] ? `${key}=${labels[key]}` : key;
          const isLast = index === entries.length - 1;

          return (
            <span key={key} className="co-text-node">
              <StackItem>{isLast ? labelText : `${labelText},`}</StackItem>
            </span>
          );
        })
      )}
    </div>
  );
};

export default NodeSelectorViewDetailsItemContent;
