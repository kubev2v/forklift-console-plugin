import type { FC } from 'react';

import { Title } from '@patternfly/react-core';

type EditVmWizardSubsectionTitleProps = {
  description: string;
  title: string;
};

const EditVmWizardSubsectionTitle: FC<EditVmWizardSubsectionTitleProps> = ({
  description,
  title,
}) => (
  <>
    <Title headingLevel="h3">{title}</Title>
    <p className="edit-vm-wizard-section-description">{description}</p>
  </>
);

export default EditVmWizardSubsectionTitle;
