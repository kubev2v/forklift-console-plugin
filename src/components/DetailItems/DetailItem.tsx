import type { FC, MouseEvent, ReactNode } from 'react';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';

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

import { ensureArray } from '../../utils/ensureArray';
import { isEmpty } from '../../utils/helpers';

/**
 * Component for displaying title with help text in a popover.
 *
 * @component
 */
const DescriptionTitleWithHelp: FC<{
  title: string;
  helpContent: ReactNode;
  showHelpIconNextToTitle: boolean;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  crumbs?: string[];
}> = ({
  crumbs,
  helpContent,
  moreInfoLabel = 'More info:',
  moreInfoLink,
  showHelpIconNextToTitle = false,
  title,
}) => {
  const onClick: (event: MouseEvent<HTMLButtonElement>) => void = (event) => {
    event.preventDefault();
  };

  return (
    <DescriptionListTermHelpText className="pf-v5-u-align-items-center">
      {showHelpIconNextToTitle ? <div>{title} &nbsp;</div> : null}
      <Popover
        headerContent={<div>{title}</div>}
        bodyContent={
          <Flex direction={{ default: 'column' }}>
            <FlexItem>{helpContent}</FlexItem>

            {moreInfoLink && (
              <FlexItem>
                {moreInfoLabel}{' '}
                <ExternalLink href={moreInfoLink} isInline hideIcon>
                  <Truncate content={moreInfoLink} />
                </ExternalLink>
              </FlexItem>
            )}

            {!isEmpty(crumbs) && (
              <FlexItem>
                <Breadcrumb>
                  {crumbs.map((crumb) => (
                    <BreadcrumbItem key={crumb}>{crumb}</BreadcrumbItem>
                  ))}
                </Breadcrumb>
              </FlexItem>
            )}
          </Flex>
        }
      >
        {showHelpIconNextToTitle ? (
          <Button variant={ButtonVariant.plain} className="pf-v5-u-p-0" onClick={onClick}>
            <Icon size="sm">
              <HelpIcon />
            </Icon>
          </Button>
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
export const DisplayTitle: FC<{
  title: string;
  helpContent?: ReactNode;
  showHelpIconNextToTitle?: boolean;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  crumbs?: string[];
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
      title={title}
      helpContent={helpContent}
      showHelpIconNextToTitle={showHelpIconNextToTitle}
      moreInfoLabel={moreInfoLabel}
      moreInfoLink={moreInfoLink}
      crumbs={crumbs}
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
  content: ReactNode;
  onEdit: () => void;
  canEdit?: boolean;
}> = ({ canEdit = true, content, onEdit }) =>
  canEdit && onEdit ? (
    <DescriptionListDescription>
      <Flex alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem spacer={{ default: 'spacerNone' }}>{content}</FlexItem>
        <FlexItem spacer={{ default: 'spacerNone' }}>
          <Button
            variant={ButtonVariant.link}
            isInline
            onClick={onEdit}
            icon={<Pencil />}
            iconPosition="right"
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
  title: string;
  'data-testid'?: string;
  helpContent?: ReactNode;
  showHelpIconNextToTitle?: boolean;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  crumbs?: string[];
  content: ReactNode | ReactNode[];
  onEdit?: (() => void) | (() => void)[];
  canEdit?: boolean;
};

export const DetailsItem: FC<DetailsItemProps> = ({
  canEdit,
  content,
  crumbs,
  'data-testid': dataTestId,
  helpContent,
  moreInfoLabel,
  moreInfoLink,
  onEdit,
  showHelpIconNextToTitle,
  title,
}) => {
  const contents = ensureArray(content);
  const onEdits = ensureArray(onEdit);

  return (
    <DescriptionListGroup data-testid={dataTestId}>
      <DisplayTitle
        title={title}
        helpContent={helpContent}
        showHelpIconNextToTitle={showHelpIconNextToTitle}
        moreInfoLabel={moreInfoLabel}
        moreInfoLink={moreInfoLink}
        crumbs={crumbs}
      />
      <DescriptionListDescription>
        {contents?.map((value, index) => (
          <ContentField
            key={`content-field-${index}`}
            content={value as ReactNode}
            onEdit={onEdits?.[index] as () => void}
            canEdit={canEdit}
          />
        ))}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};
