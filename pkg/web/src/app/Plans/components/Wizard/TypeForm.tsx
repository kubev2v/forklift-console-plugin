import * as React from 'react';
import { List, ListItem, Radio } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanWizardFormState } from './PlanWizard';
import { warmCriticalConcerns, someVMHasConcern } from './helpers';
import { SourceVM } from '@app/queries/types';
import { StatusIcon } from '@migtools/lib-ui';

interface ITypeFormProps {
  form: PlanWizardFormState['type'];
  selectedVMs: SourceVM[];
}

export const TypeForm: React.FunctionComponent<ITypeFormProps> = ({
  form,
  selectedVMs,
}: ITypeFormProps) => {
  const warmCriticalConcernsFound = warmCriticalConcerns.filter((label) =>
    someVMHasConcern(selectedVMs, label)
  );
  const isAnalyzingVms = selectedVMs.some((vm) => vm.revisionValidated !== vm.revision);

  return (
    <>
      <Radio
        id="migration-type-cold"
        name="migration-type"
        label="Cold migration"
        description={
          <List>
            <ListItem>Source VMs are shut down while all of the VM data is migrated.</ListItem>
          </List>
        }
        isChecked={form.values.type === 'Cold'}
        onChange={() => form.fields.type.setValue('Cold')}
        className={spacing.mbMd}
      />
      <Radio
        id="migration-type-warm"
        name="migration-type"
        label="Warm migration"
        description={
          <>
            <List>
              <ListItem>VM data is incrementally copied, leaving source VMs running.</ListItem>
              <ListItem>
                A final cutover, which shuts down the source VMs while VM data and metadata are
                copied, is run later.
              </ListItem>
            </List>
            {isAnalyzingVms ? (
              <div className={`${spacing.mtMd} ${spacing.mlXs}`}>
                <StatusIcon status="Loading" label="Analyzing warm migration compatibility" />
              </div>
            ) : warmCriticalConcernsFound.length > 0 ? (
              <div className={`${spacing.mtMd} ${spacing.mlXs}`}>
                <StatusIcon
                  status="Error"
                  label="Warm migration will fail for one or more VMs because of the following conditions:"
                />
                <List className={`${spacing.mtSm} ${spacing.mlMd}`}>
                  {warmCriticalConcernsFound.map((label) => (
                    <ListItem key={label}>{label}</ListItem>
                  ))}
                </List>
              </div>
            ) : null}
          </>
        }
        isChecked={form.values.type === 'Warm'}
        onChange={() => form.fields.type.setValue('Warm')}
      />
    </>
  );
};
