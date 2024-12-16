import React from 'react';
import { useForkliftTranslation } from 'src/utils';

import { FormGroupWithHelpText, TypeaheadSelect, TypeaheadSelectOption } from '@kubev2v/common';
import { Popover } from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

interface ProjectNameSelectProps {
  value: string | undefined;
  options: TypeaheadSelectOption[];
  onSelect: (value: string) => void;
  isDisabled?: boolean;
  popoverHelpContent?: React.ReactNode;
}

export const ProjectNameSelect: React.FC<ProjectNameSelectProps> = ({
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
