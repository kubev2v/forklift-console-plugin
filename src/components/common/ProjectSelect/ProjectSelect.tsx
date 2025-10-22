import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import ProjectSelectTypeAhead from '@components/common/ProjectSelect/ProjectSelectTypeAhead';
import type { ProjectSelectProps } from '@components/common/ProjectSelect/types';

const ProjectSelect: FC<ProjectSelectProps> = ({ ...props }) => (
  <ModalHOC>
    <ProjectSelectTypeAhead {...props} />
  </ModalHOC>
);

export default ProjectSelect;
