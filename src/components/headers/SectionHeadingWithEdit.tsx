import type { FC } from 'react';

import { Button, ButtonVariant, Flex } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import SectionHeading, { type SectionHeadingProps } from './SectionHeading';

type SectionHeadingWithEditProps = Omit<
  {
    title: string;
    editable: boolean;
    onClick: () => void;
  } & SectionHeadingProps,
  'text'
>;

const SectionHeadingWithEdit: FC<SectionHeadingWithEditProps> = ({
  editable,
  onClick,
  title,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  return (
    <SectionHeading
      {...rest}
      text={
        <Flex direction={{ default: 'row' }} gap={{ default: 'gapSm' }}>
          {title}
          <Button
            icon={<PencilAltIcon />}
            variant={ButtonVariant.link}
            onClick={onClick}
            isDisabled={!editable}
          >
            {t('Edit')}
          </Button>
        </Flex>
      }
    />
  );
};

export default SectionHeadingWithEdit;
