import type { FC } from 'react';

import { Button, type ButtonProps, ButtonVariant, Flex } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import SectionHeading, { type SectionHeadingProps } from './SectionHeading';

type AdditionalActionProps = ButtonProps & { 'data-testid'?: string };

type SectionHeadingWithEditProps = Omit<
  {
    onClick: () => void;
    title: string;
    editable?: boolean;
    additionalActions?: AdditionalActionProps[];
    'data-testid'?: string;
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
            icon={<PencilAltIcon />}
            variant={ButtonVariant.link}
            onClick={onClick}
            isDisabled={!editable}
            data-testid={dataTestId}
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
