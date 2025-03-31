import React, { type FC, type ReactNode } from 'react';
import { useForkliftTranslation } from 'src/utils';

import {
  type K8sResourceKind,
  useFlag,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Popover } from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { FormGroupWithHelpText } from './FormGroupWithHelpText/FormGroupWithHelpText';
import { TypeaheadSelect, type TypeaheadSelectOption } from './TypeaheadSelect/TypeaheadSelect';

type ProjectNameSelectProps = {
  value: string | undefined;
  options: TypeaheadSelectOption[];
  onSelect: (value: string) => void;
  isDisabled?: boolean;
  popoverHelpContent?: ReactNode;
};

export const ProjectNameSelect: FC<ProjectNameSelectProps> = ({
  isDisabled,
  onSelect,
  options,
  popoverHelpContent,
  value,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <FormGroupWithHelpText
      label={t('Project new')}
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
        onSelect={(_, value) => {
          onSelect(String(value));
        }}
        onClearSelection={() => {
          onSelect('');
        }}
        isDisabled={isDisabled}
      />
    </FormGroupWithHelpText>
  );
};

export const useProjectNameSelectOptions = (defaultProject: string): TypeaheadSelectOption[] => {
  const isUseProjects = useFlag('OPENSHIFT'); // OCP or Kind installations

  const [projects, projectsLoaded, projectsLoadError] = useK8sWatchResource<K8sResourceKind[]>({
    isList: true,
    kind: isUseProjects ? 'Project' : 'Namespace',
  });

  return projects.length === 0 || !projectsLoaded || projectsLoadError
    ? // In case of an error or an empty list, returns the active namespace
      [{ content: defaultProject, value: defaultProject }]
    : projects.map((project) => ({
        content: project.metadata?.name,
        value: project.metadata?.name,
      }));
};
