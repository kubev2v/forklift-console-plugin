import type { FC } from 'react';

import { Button, type ButtonProps, ButtonVariant, Flex } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import SectionHeading, { type SectionHeadingProps } from './SectionHeading';

type AdditionalActionProps = ButtonProps & { 'data-testid'?: string };

type SectionHeadingWithEditProps = Omit<
  {
    additionalActions?: AdditionalActionProps[];
    'data-testid'?: string;
    editable?: boolean;
    onClick: () => void;
    title: string;
  } & SectionHeadingProps,
  'text'
>;

const SectionHeadingWithEdit: FC<SectionHeadingWithEditProps> = ({
  additionalActions,
  children,
  'data-testid': dataTestId,
  editable = true,
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
            data-testid={dataTestId}
            icon={<PencilAltIcon />}
            isDisabled={!editable}
            onClick={onClick}
            variant={ButtonVariant.link}
          >
            {t('Edit')}
          </Button>
          {!isEmpty(additionalActions) &&
            additionalActions?.map((action) => (
              <Button {...action} key={action.key} variant={ButtonVariant.link} />
            ))}
        </Flex>
      }
    >
      {children}
    </SectionHeading>
  );
};

export default SectionHeadingWithEdit;
