import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import ProjectSelectEmptyState from '@components/common/ProjectSelect/ProjectSelectEmptyState';
import type { ProjectSelectProps } from '@components/common/ProjectSelect/types';
import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import CreateProjectModal, {
  type CreateProjectModalProps,
} from '@components/modals/CreateProjectModal';
import {
  type K8sResourceCommon,
  useAccessReview,
  useOverlay,
} from '@openshift-console/dynamic-plugin-sdk';
import { ProjectModel } from '@openshift-console/dynamic-plugin-sdk/lib/models';
import { Bullseye, Button, ButtonVariant, Divider, Spinner, Switch } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { isSystemNamespace } from '@utils/namespaces';

const showDefaultTargetsSwitchTestId = 'show-default-projects-switch';

const ProjectSelect: FC<ProjectSelectProps> = ({
  defaultProject,
  emptyStateMessage,
  errorLoading = null,
  id,
  isDisabled = false,
  loading = false,
  noOptionsMessage,
  onChange,
  onNewValue,
  placeholder,
  projectNames,
  setShowDefaultProjects,
  showDefaultProjects,
  testId = 'target-project-select',
  toggleProps,
  value,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shouldRefocusFilterRef = useRef(false);
  const [refocusRequest, setRefocusRequest] = useState(0);
  const [canCreate, loadingCreate] = useAccessReview({
    group: ProjectModel.apiGroup,
    resource: ProjectModel.plural,
    verb: 'create',
  });
  const createAllowed = !loadingCreate && canCreate && Boolean(onNewValue);

  const projectOptions = useMemo(() => {
    if (!isEmpty(projectNames)) {
      return projectNames
        .filter(
          (projectName) =>
            showDefaultProjects || !isSystemNamespace(projectName) || projectName === value,
        )
        .map((projectName) => ({
          content: projectName,
          value: projectName,
        }));
    }
    return defaultProject ? [{ content: defaultProject, value: defaultProject }] : [];
  }, [projectNames, defaultProject, showDefaultProjects, value]);

  // Toggling "show default projects" steals focus into the switch, so the filter input is
  // re-focused once the repopulated options commit. The request counter makes the effect run
  // even when a caller pins the prop (map wizards force it true for a system default project)
  // and the option list keeps its identity; a timer used to fire mid-click.
  useEffect(() => {
    if (!shouldRefocusFilterRef.current) {
      return;
    }
    shouldRefocusFilterRef.current = false;
    inputRef.current?.focus();
  }, [projectOptions, refocusRequest]);

  const onProjectCreated = (newProject: K8sResourceCommon): void => {
    const projectName = getName(newProject);
    if (onNewValue && projectName) {
      onNewValue(projectName);
    }
  };

  const onNewProject = (): void => {
    launchOverlay<CreateProjectModalProps>(CreateProjectModal, { onCreated: onProjectCreated });
  };

  return (
    <TypeaheadSelect
      allowClear
      defaultValue={defaultProject}
      emptyState={
        loading ? (
          <Bullseye className="pf-v6-u-my-lg">
            <Spinner />
          </Bullseye>
        ) : (
          <ProjectSelectEmptyState
            emptyStateMessage={emptyStateMessage}
            errorLoading={errorLoading}
            onCreate={createAllowed ? onNewProject : undefined}
          />
        )
      }
      filterControls={
        <>
          <div className="pf-v6-u-px-md pf-v6-u-py-md">
            <Switch
              data-testid={showDefaultTargetsSwitchTestId}
              id={showDefaultTargetsSwitchTestId}
              isChecked={showDefaultProjects}
              label={t('Show default projects')}
              onChange={(_event, checked) => {
                shouldRefocusFilterRef.current = true;
                setShowDefaultProjects(checked);
                setRefocusRequest((request) => request + 1);
              }}
            />
          </div>
          <Divider />
        </>
      }
      footer={
        createAllowed ? (
          <Button
            data-testid="create-project-button"
            icon={<PlusCircleIcon />}
            isInline
            onClick={onNewProject}
            variant={ButtonVariant.link}
          >
            {t('Create project')}
          </Button>
        ) : undefined
      }
      id={id}
      isDisabled={isDisabled}
      isScrollable
      noOptionsMessage={noOptionsMessage}
      onChange={onChange}
      options={projectOptions}
      placeholder={placeholder ?? t('Select a project')}
      ref={inputRef}
      testId={testId}
      toggleProps={toggleProps}
      value={value ?? ''}
    />
  );
};

export default ProjectSelect;
