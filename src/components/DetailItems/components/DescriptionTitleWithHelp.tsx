import type { FC, MouseEvent, ReactNode } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Flex,
  FlexItem,
  Icon,
  Popover,
  Truncate,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

type DescriptionTitleWithHelpProps = {
  crumbs?: string[];
  helpContent: ReactNode;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  showHelpIconNextToTitle: boolean;
  title: string;
};

const DescriptionTitleWithHelp: FC<DescriptionTitleWithHelpProps> = ({
  crumbs,
  helpContent,
  moreInfoLabel = 'More info:',
  moreInfoLink,
  showHelpIconNextToTitle,
  title,
}) => {
  const onClick: (event: MouseEvent<HTMLButtonElement>) => void = (event) => {
    event.preventDefault();
  };

  return (
    <DescriptionListTermHelpText className="pf-v6-u-align-items-center">
      {showHelpIconNextToTitle ? <div>{title} &nbsp;</div> : null}
      <Popover
        bodyContent={
          <Flex direction={{ default: 'column' }}>
            <FlexItem>{helpContent}</FlexItem>

            {moreInfoLink && (
              <FlexItem>
                {moreInfoLabel}{' '}
                <ExternalLink hideIcon href={moreInfoLink} isInline>
                  <Truncate content={moreInfoLink} />
                </ExternalLink>
              </FlexItem>
            )}

            {!isEmpty(crumbs) && (
              <FlexItem>
                <Flex direction={{ default: 'row' }} flexWrap={{ default: 'nowrap' }}>
                  <Breadcrumb>
                    {crumbs?.map((crumb) => (
                      <BreadcrumbItem key={crumb}>{crumb}</BreadcrumbItem>
                    ))}
                  </Breadcrumb>
                </Flex>
              </FlexItem>
            )}
          </Flex>
        }
        headerContent={<div>{title}</div>}
      >
        {showHelpIconNextToTitle ? (
          <Button
            className="pf-v6-u-p-0"
            icon={
              <Icon size="sm">
                <HelpIcon />
              </Icon>
            }
            onClick={onClick}
            variant={ButtonVariant.plain}
          />
        ) : (
          <DescriptionListTermHelpTextButton> {title} </DescriptionListTermHelpTextButton>
        )}
      </Popover>
    </DescriptionListTermHelpText>
  );
};

export default DescriptionTitleWithHelp;
