import type { FC } from 'react';

import { Button, ButtonVariant, Content, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n.tsx';

const ProjectNameHelp: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Popover
      aria-label={t('Naming information')}
      bodyContent={
        <Content>
          <Content component="p">
            {t(`A Project name must consist of lower case alphanumeric characters or '-', and must start
            and end with an alphanumeric character (e.g. 'my-name' or '123-abc').`)}
          </Content>
          <Content component="p">
            {t(`You must create a Namespace to be able to create projects that begin with 'openshift-',
            'kubernetes-', or 'kube-'.`)}
          </Content>
        </Content>
      }
    >
      <Button
        icon={<OutlinedQuestionCircleIcon />}
        variant={ButtonVariant.plain}
        aria-label="View naming information"
      />
    </Popover>
  );
};

export default ProjectNameHelp;
