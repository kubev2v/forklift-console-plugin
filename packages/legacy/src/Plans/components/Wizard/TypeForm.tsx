import * as React from 'react';
import { Alert, List, ListItem, Radio, Stack, StackItem } from '@patternfly/react-core';
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
  const warmCriticalConcernsFound = warmCriticalConcerns.filter((label) =>
    someVMHasConcern(selectedVMs, label)
  );
  const isAnalyzingVms = selectedVMs.some((vm) => vm.revisionValidated !== vm.revision);

  const secretsQuery = useSecretsQuery([sourceProvider.object?.spec?.secret?.name], namespace);
  const isSourceOvirtInsecure = checkIfOvirtInsecureProvider(sourceProvider, secretsQuery.data);
  const isSourceOpenstack = sourceProvider?.type === 'openstack';
  const isSourceOCP = sourceProvider?.type === 'openshift';
  const isSourceOVA = sourceProvider?.type === 'ova';
  const isDisabled = isSourceOvirtInsecure || isSourceOpenstack || isSourceOCP || isSourceOVA;

  return (
    <ResolvedQueries results={[secretsQuery]} errorTitles={['Cannot load provider secrets']}>
      <Stack hasGutter>
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
            <Alert variant="warning" isInline title="Warm migration is not currently available.">
              Warm migrations from {PROVIDER_TYPE_NAMES.ovirt} source providers are only supported
              with a verified secure connection.
            </Alert>
          </StackItem>
        )}

        {!isSourceOvirtInsecure && isDisabled && (
          <StackItem>
            <Alert variant="warning" isInline title="Warm migration is not currently available.">
              Warm migrations from {PROVIDER_TYPE_NAMES?.[sourceProvider?.type]} source providers
              are unsupported.
            </Alert>
          </StackItem>
        )}

        <StackItem>
          <Radio
            id="migration-type-warm"
            name="migration-type"
            label="Warm migration"
            isDisabled={isDisabled}
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
              !isDisabled && (
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
              )
            }
            isChecked={form.values.type === 'Warm'}
            onChange={() => form.fields.type.setValue('Warm')}
          />
        </StackItem>
      </Stack>
    </ResolvedQueries>
  );
};
