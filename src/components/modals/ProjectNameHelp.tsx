import type { FC } from 'react';

import { Button, ButtonVariant, Popover, Text, TextContent } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n.tsx';

const ProjectNameHelp: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Popover
      aria-label={t('Naming information')}
      bodyContent={
        <TextContent>
          <Text component="p">
            {t(`A Project name must consist of lower case alphanumeric characters or '-', and must start
            and end with an alphanumeric character (e.g. 'my-name' or '123-abc').`)}
          </Text>
          <Text component="p">
            {t(`You must create a Namespace to be able to create projects that begin with 'openshift-',
            'kubernetes-', or 'kube-'.`)}
          </Text>
        </TextContent>
      }
    >
      <Button variant={ButtonVariant.plain} aria-label="View naming information">
        <OutlinedQuestionCircleIcon />
      </Button>
    </Popover>
  );
};

export default ProjectNameHelp;
