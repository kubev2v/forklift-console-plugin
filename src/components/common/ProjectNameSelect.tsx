import type { FC } from 'react';
import useProjectNameSelectOptions from 'src/providers/create/hooks/useProjectNameSelectOptions';
import { PROJECT_NAME_SELECT_POPOVER_HELP_CONTENT } from 'src/providers/create/utils/constants';
import { ProviderFieldsId } from 'src/providers/utils/constants';

import { useForkliftTranslation } from '@utils/i18n';

import { FormGroupWithHelpText } from './FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from './HelpIconPopover/HelpIconPopover';
import TypeaheadSelect from './TypeaheadSelect/TypeaheadSelect';

type ProjectNameSelectProps = {
  projectName: string | undefined;
  onSelect: ((value: string) => void) | undefined;
};

export const ProjectNameSelect: FC<ProjectNameSelectProps> = ({ onSelect, projectName }) => {
  const { t } = useForkliftTranslation();
  const [projectNameOptions] = useProjectNameSelectOptions(projectName);

  return (
    <FormGroupWithHelpText
      label={t('Project')}
      isRequired
      fieldId={ProviderFieldsId.Project}
      labelIcon={
        <HelpIconPopover popoverProps={{ alertSeverityVariant: 'info' }}>
          {PROJECT_NAME_SELECT_POPOVER_HELP_CONTENT}
        </HelpIconPopover>
      }
    >
      <TypeaheadSelect
        isScrollable
        allowClear
        id="project-name-select"
        options={projectNameOptions}
        value={projectName}
        onChange={(value) => {
          onSelect?.(value as string);
        }}
      />
    </FormGroupWithHelpText>
  );
};
