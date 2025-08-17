import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import ProjectSelectTypeAhead from '@components/common/ProjectSelect/ProjectSelectTypeAhead.tsx';
import type { ProjectSelectProps } from '@components/common/ProjectSelect/types.ts';

const ProjectSelect: FC<ProjectSelectProps> = ({ ...props }) => (
  <ModalHOC>
    <ProjectSelectTypeAhead {...props} />
  </ModalHOC>
);

export default ProjectSelect;
