import { type FC, useState } from 'react';
import { PROJECT_NAME_SELECT_POPOVER_HELP_CONTENT } from 'src/providers/create/utils/constants';
import { ProviderFieldsId } from 'src/providers/utils/constants';

import ProjectSelect from '@components/common/ProjectSelect/ProjectSelect.tsx';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames.ts';
import { useForkliftTranslation } from '@utils/i18n';

import { FormGroupWithHelpText } from './FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from './HelpIconPopover/HelpIconPopover';

type ProjectNameSelectProps = {
  projectName: string | undefined;
  onSelect?: (value: string) => void;
};

export const ProjectNameSelect: FC<ProjectNameSelectProps> = ({ onSelect, projectName }) => {
  const { t } = useForkliftTranslation();
  const [showDefaultProjects, setShowDefaultProjects] = useState<boolean>(false);
  const [projectNames] = useWatchProjectNames();

  return (
    <FormGroupWithHelpText
      label={t('Project')}
      isRequired
      fieldId={ProviderFieldsId.Project}
      labelHelp={
        <HelpIconPopover popoverProps={{ alertSeverityVariant: 'info' }}>
          {PROJECT_NAME_SELECT_POPOVER_HELP_CONTENT}
        </HelpIconPopover>
      }
    >
      <ProjectSelect
        id="project-name-select"
        projectNames={projectNames}
        value={projectName}
        onChange={onSelect}
        defaultProject={projectName}
        onNewValue={onSelect}
        showDefaultProjects={showDefaultProjects}
        setShowDefaultProjects={setShowDefaultProjects}
      />
    </FormGroupWithHelpText>
  );
};
