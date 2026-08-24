import type { FC, ReactNode } from 'react';

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
  const contents = ensureArray(content);
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
        {contents?.map((value, index) => (
          <ContentField
            canEdit={canEdit}
            content={value as ReactNode}
            key={`content-field-${index}`}
            onEdit={onEdits?.[index] as () => void}
          />
        ))}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};
