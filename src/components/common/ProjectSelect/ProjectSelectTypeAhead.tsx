import { type FC, useMemo, useRef } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isSystemNamespace } from 'src/utils/namespaces';

import ProjectSelectEmptyState from '@components/common/ProjectSelect/ProjectSelectEmptyState';
import type { ProjectSelectProps } from '@components/common/ProjectSelect/types.ts';
import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import CreateProjectModal from '@components/modals/CreateProjectModal';
import { type K8sResourceCommon, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { ProjectModel } from '@openshift-console/dynamic-plugin-sdk/lib/models';
import { Button, ButtonVariant, Divider, Switch } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { getName } from '@utils/crds/common/selectors.ts';
import { isEmpty } from '@utils/helpers.ts';
import { useForkliftTranslation } from '@utils/i18n';

const showDefaultTargetsSwitchTestId = 'show-default-projects-switch';

const ProjectSelectTypeAhead: FC<ProjectSelectProps> = ({
  defaultProject,
  emptyStateMessage,
  id,
  isDisabled = false,
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
  const { showModal } = useModal();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [canCreate, loadingCreate] = useAccessReview({
    group: ProjectModel.apiGroup,
    resource: ProjectModel.plural,
    verb: 'create',
  });
  const createAllowed = !loadingCreate && canCreate && Boolean(onNewValue);

  const projectOptions = useMemo(() => {
    if (!isEmpty(projectNames)) {
      return projectNames
        .filter((projectName) => showDefaultProjects || !isSystemNamespace(projectName))
        .map((projectName) => ({
          content: projectName,
          value: projectName,
        }));
    }
    return defaultProject ? [{ content: defaultProject, value: defaultProject }] : [];
  }, [projectNames, defaultProject, showDefaultProjects]);

  const onProjectCreated = (newProject: K8sResourceCommon) => {
    const projectName = getName(newProject);
    if (onNewValue && projectName) {
      onNewValue(projectName);
    }
  };

  const onNewProject = () => {
    showModal(<CreateProjectModal onCreated={onProjectCreated} />);
  };

  return (
    <TypeaheadSelect
      testId={testId}
      ref={inputRef}
      isScrollable
      isDisabled={isDisabled}
      allowClear
      placeholder={placeholder ?? t('Select a project')}
      id={id}
      options={projectOptions}
      defaultValue={defaultProject}
      value={value ?? ''}
      onChange={onChange}
      footer={
        createAllowed ? (
          <Button
            variant={ButtonVariant.link}
            isInline
            icon={<PlusCircleIcon />}
            onClick={onNewProject}
          >
            {t('Create project')}
          </Button>
        ) : undefined
      }
      noOptionsMessage={noOptionsMessage}
      toggleProps={toggleProps}
      emptyState={
        <ProjectSelectEmptyState
          emptyStateMessage={emptyStateMessage}
          onCreate={createAllowed ? onNewProject : undefined}
        />
      }
      filterControls={
        <>
          <div className="pf-v5-u-px-md pf-v5-u-py-md">
            <Switch
              id={showDefaultTargetsSwitchTestId}
              data-testid={showDefaultTargetsSwitchTestId}
              label={t('Show default projects')}
              isChecked={showDefaultProjects}
              onChange={(_event, checked) => {
                setShowDefaultProjects(checked);
                // Delay here so that the list is repopulated before attempting to re-focus
                setTimeout(() => inputRef.current?.focus(), 500);
              }}
            />
          </div>
          <Divider />
        </>
      }
    />
  );
};

export default ProjectSelectTypeAhead;
