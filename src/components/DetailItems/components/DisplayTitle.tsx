import type { FC, ReactNode } from 'react';

import DescriptionTitle from './DescriptionTitle';
import DescriptionTitleWithHelp from './DescriptionTitleWithHelp';

type DisplayTitleProps = {
  crumbs?: string[];
  helpContent?: ReactNode;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  showHelpIconNextToTitle?: boolean;
  title: string;
};

const DisplayTitle: FC<DisplayTitleProps> = ({
  crumbs,
  helpContent,
  moreInfoLabel,
  moreInfoLink,
  showHelpIconNextToTitle = false,
  title,
}) =>
  helpContent ? (
    <DescriptionTitleWithHelp
      crumbs={crumbs}
      helpContent={helpContent}
      moreInfoLabel={moreInfoLabel}
      moreInfoLink={moreInfoLink}
      showHelpIconNextToTitle={showHelpIconNextToTitle}
      title={title}
    />
  ) : (
    <DescriptionTitle title={title} />
  );

export default DisplayTitle;
