import type { FC, MouseEvent, ReactNode } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Flex,
  FlexItem,
  Icon,
  Popover,
  Truncate,
} from '@patternfly/react-core';
import { HelpIcon, PencilAltIcon as Pencil } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

import { ensureArray } from '../../utils/ensureArray';

/**
 * Component for displaying title with help text in a popover.
 *
 * @component
 */
const DescriptionTitleWithHelp: FC<{
  crumbs?: string[];
  helpContent: ReactNode;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  showHelpIconNextToTitle: boolean;
  title: string;
}> = ({
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

/**
 * Component for displaying title without a popover.
 *
 * @component
 */
const DescriptionTitle: FC<{ title: string }> = ({ title }) => (
  <DescriptionListTerm> {title} </DescriptionListTerm>
);

/**
 * Component for displaying an item's title
 *
 * @component
 */
const DisplayTitle: FC<{
  crumbs?: string[];
  helpContent?: ReactNode;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  showHelpIconNextToTitle?: boolean;
  title: string;
}> = ({
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

/**
 * Component for displaying an editable or non editable content field with the following format:
 * The content field's element and if editable, next to that appears a press-able inline
 * link edit button with the pencil icon, for triggering the onEdit callback.
 *
 * @component
 * @param {ReactNode} content - The field's content element.
 * @param {Function} onEdit - Function to be called when the button is clicked.
 */

const ContentField: FC<{
  canEdit?: boolean;
  content: ReactNode;
  onEdit: () => void;
}> = ({ canEdit = true, content, onEdit }) =>
  canEdit && onEdit ? (
    <DescriptionListDescription>
      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>{content}</FlexItem>
        <FlexItem>
          <Button
            icon={<Pencil />}
            iconPosition="right"
            isInline
            onClick={onEdit}
            variant={ButtonVariant.link}
          />
        </FlexItem>
      </Flex>
    </DescriptionListDescription>
  ) : (
    <DescriptionListDescription>{content}</DescriptionListDescription>
  );

/**
 * Component for displaying a details item.
 * It can optionally include a help text popover, breadcrumbs, and an edit button.
 *
 * @component
 * @param {DetailsItemProps} props - The props of the details item.
 */

/**
 * Type for the props of the DetailsItem component.
 *
 * @typedef {Object} DetailsItemProps
 * @property {string} title - The title of the details item.
 * @property {ReactNode} [helpContent] - The content to display in the help popover.
 * @property {ReactNode} [showHelpIconNextToTitle] - if true, adding a help icon next to the title for displaying the help popover.
 *    If false, show the default Patternfly dashed line under the title.
 * @property {string[]} [crumbs] - Breadcrumbs for the details item.
 * @property {ReactNode | ReactNode[]} content - Array of content fields to be displayed for the details item.
 * @property {Function | Function[]} onEdit - Array of functions per content field to be called when the edit button is clicked or null if the field is non editable.
 * @property {boolean} [showEditButton] - If true, show the edit button next to the content field, when missing falling back to onEdit existence.
 */
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
