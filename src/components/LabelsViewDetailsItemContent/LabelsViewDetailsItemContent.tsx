import type { FC } from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import './LabelsViewDetailsItemContent.scss';

type LabelsViewDetailsItemContentProps = {
  labels: Record<string, string> | undefined;
};

const LabelsViewDetailsItemContent: FC<LabelsViewDetailsItemContentProps> = ({ labels }) => {
  if (isEmpty(labels)) {
    return (
      <Label isCompact color="grey">
        {t('No labels defined')}
      </Label>
    );
  }

  return (
    <LabelGroup
      className={`labels-view-details-item${isEmpty(labels) ? '--empty' : ''}`}
      numLabels={4}
    >
      {Object.keys(labels ?? {})?.map((key) => {
        const labelText = labels?.[key] ? `${key}=${labels[key]}` : key;

        return (
          <Label className="co-label" key={key} textMaxWidth={'25em'}>
            {labelText}
          </Label>
        );
      })}
    </LabelGroup>
  );
};

export default LabelsViewDetailsItemContent;
