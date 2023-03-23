import * as React from 'react';
import { Alert, Button, List, ListItem, Radio, Stack, StackItem, WizardContext } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanWizardFormState } from './PlanWizard';
import { warmCriticalConcerns, someVMHasConcern } from './helpers';
import { SourceInventoryProvider, SourceVM } from 'legacy/src/queries/types';
import { StatusIcon } from '@migtools/lib-ui';
import { useSecretsQuery } from 'legacy/src/queries';
import { ResolvedQueries } from 'legacy/src/common/components/ResolvedQuery';
import { checkIfOvirtInsecureProvider } from 'legacy/src/common/helpers';
import { PROVIDER_TYPE_NAMES } from 'legacy/src/common/constants';

interface ITypeFormProps {
  form: PlanWizardFormState['type'];
  sourceProvider: SourceInventoryProvider;
  selectedVMs: SourceVM[];
  namespace: string;
}

export const TypeForm: React.FunctionComponent<ITypeFormProps> = ({
  form,
  sourceProvider,
  selectedVMs,
  namespace,
}: ITypeFormProps) => {
  const { goToStepById } = React.useContext(WizardContext);

  const warmCriticalConcernsFound = warmCriticalConcerns.filter((label) =>
    someVMHasConcern(selectedVMs, label)
  );
  const isAnalyzingVms = selectedVMs.some((vm) => vm.revisionValidated !== vm.revision);

  const secretsQuery = useSecretsQuery([sourceProvider.object?.spec?.secret?.name], namespace);
  const isSourceOvirtInsecure = checkIfOvirtInsecureProvider(sourceProvider, secretsQuery.data);

  return (
    <ResolvedQueries
      results={[secretsQuery]}
      errorTitles={['Cannot load provider secrets']}
    >
      <Stack hasGutter >
        <StackItem>
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
          />
        </StackItem>

        {isSourceOvirtInsecure && (
          <StackItem>
            <Alert
              variant="warning"
              isInline
              title="A warm migration is not currently available."
            >
              A warm migration from a {PROVIDER_TYPE_NAMES.ovirt} source provider is only supported
              with a verified secure connection.  To enable a warm migration, first select a secure provider
              on the <Button variant="link" isInline onClick={() => goToStepById(0)} >General step</Button>.
            </Alert>
          </StackItem>
        )}

        <StackItem>
          <Radio
            id="migration-type-warm"
            name="migration-type"
            label="Warm migration"
            isDisabled={isSourceOvirtInsecure}
            description={
              <List>
                <ListItem>VM data is incrementally copied, leaving source VMs running.</ListItem>
                <ListItem>
                  A final cutover, which shuts down the source VMs while VM data and metadata are
                  copied, is run later.
                </ListItem>
              </List>
            }
            body={
              <>
                {isAnalyzingVms && (
                  <div className={`${spacing.mtMd} ${spacing.mlXs}`}>
                    <StatusIcon status="Loading" label="Analyzing warm migration compatibility" />
                  </div>
                )}

                {!isAnalyzingVms && warmCriticalConcernsFound.length > 0 && (
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
                )}
              </>
            }
            isChecked={form.values.type === 'Warm'}
            onChange={() => form.fields.type.setValue('Warm')}
          />
        </StackItem>
      </Stack>
    </ResolvedQueries>
  );
};
