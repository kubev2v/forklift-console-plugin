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

const getContentBaseKey = (value: ReactNode, title: string): string => {
  if (isValidElement(value) && typeof value.key === 'string') {
    return value.key;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return title;
};

const toContentEntries = (
  contents: ReactNode[],
  title: string,
): { key: string; value: ReactNode }[] => {
  const seen = new Map<string, number>();

  return contents.map((value) => {
    const base = getContentBaseKey(value, title);
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);

    return {
      key: occurrence === 0 ? base : `${base}__${occurrence}`,
      value,
    };
  });
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
  const contentEntries = toContentEntries(contents, title);

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
        {contentEntries.map(({ key, value }, index) => (
          <ContentField
            canEdit={canEdit}
            content={value}
            key={key}
            onEdit={onEdits?.[index] as () => void}
          />
        ))}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};
