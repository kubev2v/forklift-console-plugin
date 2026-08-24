import type { FC, ReactNode } from 'react';

import {
  Button,
  ButtonVariant,
  DescriptionListDescription,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { PencilAltIcon as Pencil } from '@patternfly/react-icons';

type ContentFieldProps = {
  canEdit?: boolean;
  content: ReactNode;
  onEdit: () => void;
};

const ContentField: FC<ContentFieldProps> = ({ canEdit = true, content, onEdit }) =>
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

export default ContentField;
