import { type FC, isValidElement, type ReactNode } from 'react';

import { DescriptionListDescription, DescriptionListGroup } from '@patternfly/react-core';

import { ensureArray } from '../../utils/ensureArray';

import ContentField from './components/ContentField';
import DisplayTitle from './components/DisplayTitle';

type DetailsItemProps = {
  canEdit?: boolean;
  content: ReactNode | ReactNode[];
  crumbs?: string[];
  helpContent?: ReactNode;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  onEdit?: (() => void) | (() => void)[];
  showHelpIconNextToTitle?: boolean;
  testId?: string;
  title: string;
};

const getContentKey = (value: ReactNode, title: string): string | number => {
  if (isValidElement(value) && value.key !== null && value.key !== undefined) {
    return value.key;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return title;
};

export const DetailsItem: FC<DetailsItemProps> = ({
  canEdit,
  content,
  crumbs,
  helpContent,
  moreInfoLabel,
  moreInfoLink,
  onEdit,
  showHelpIconNextToTitle,
  testId,
  title,
}) => {
  const contents = ensureArray(content) as ReactNode[];
  const onEdits = ensureArray(onEdit);

  return (
    <DescriptionListGroup data-testid={testId}>
      <DisplayTitle
        crumbs={crumbs}
        helpContent={helpContent}
        moreInfoLabel={moreInfoLabel}
        moreInfoLink={moreInfoLink}
        showHelpIconNextToTitle={showHelpIconNextToTitle}
        title={title}
      />
      <DescriptionListDescription>
        {contents.map((value, index) => (
          <ContentField
            canEdit={canEdit}
            content={value}
            key={getContentKey(value, title)}
            onEdit={onEdits?.[index] as () => void}
          />
        ))}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};
