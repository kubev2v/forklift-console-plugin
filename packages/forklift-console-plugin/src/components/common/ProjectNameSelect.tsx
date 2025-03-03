import React, { FC, ReactNode } from 'react';
import { useForkliftTranslation } from 'src/utils';

import {
  K8sResourceKind,
  useFlag,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Popover } from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { FormGroupWithHelpText } from './FormGroupWithHelpText/FormGroupWithHelpText';
import { TypeaheadSelect, TypeaheadSelectOption } from './TypeaheadSelect/TypeaheadSelect';

interface ProjectNameSelectProps {
  value: string | undefined;
  options: TypeaheadSelectOption[];
  onSelect: (value: string) => void;
  isDisabled?: boolean;
  popoverHelpContent?: ReactNode;
}

export const ProjectNameSelect: FC<ProjectNameSelectProps> = ({
  value,
  options,
  isDisabled,
  popoverHelpContent,
  onSelect,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <FormGroupWithHelpText
      label={t('Project')}
      isRequired
      fieldId="project"
      labelIcon={
        <Popover position="right" alertSeverityVariant="info" bodyContent={popoverHelpContent}>
          <button type="button" className="pf-c-form__group-label-help">
            <HelpIcon />
          </button>
        </Popover>
      }
    >
      <TypeaheadSelect
        id="project-name-select"
        selectOptions={options}
        selected={value}
        onSelect={(_, value) => onSelect(String(value))}
        onClearSelection={() => onSelect('')}
        isDisabled={isDisabled}
      />
    </FormGroupWithHelpText>
  );
};

export const useProjectNameSelectOptions = (defaultProject: string): TypeaheadSelectOption[] => {
  const isUseProjects = useFlag('OPENSHIFT'); // OCP or Kind installations

  const [projects, projectsLoaded, projectsLoadError] = useK8sWatchResource<K8sResourceKind[]>({
    kind: isUseProjects ? 'Project' : 'Namespace',
    isList: true,
  });

  return projects.length === 0 || !projectsLoaded || projectsLoadError
    ? // In case of an error or an empty list, returns the active namespace
      [{ value: defaultProject, content: defaultProject }]
    : projects.map(project => ({
        value: project.metadata?.name,
        content: project.metadata?.name,
      }));
};
