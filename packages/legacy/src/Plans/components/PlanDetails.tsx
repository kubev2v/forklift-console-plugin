import * as React from 'react';
import {
  Grid,
  GridItem,
  Popover,
  Button,
  List,
  ListItem,
  Text,
  TextContent,
  DescriptionListGroup,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { StatusIcon } from '@migtools/lib-ui';
import text from '@patternfly/react-styles/css/utilities/Text/text';

import { MappingDetailView } from 'legacy/src/Mappings/components/MappingDetailView';
import {
  HookStep,
  IPlan,
  SourceVM,
  Mapping,
  MappingType,
  POD_NETWORK,
  SourceInventoryProvider,
} from 'legacy/src/queries/types';
import { MappingStatus } from 'legacy/src/Mappings/components/MappingStatus';
import { warmCriticalConcerns, someVMHasConcern } from './Wizard/helpers';
import { VMNameWithPowerState } from 'legacy/src/common/components/VMNameWithPowerState';

interface IHookDetails {
  step: HookStep | null;
  playbook: boolean;
}

interface IPlanDetailsProps {
  plan: IPlan;
  sourceProvider: SourceInventoryProvider | null;
  networkMapping: Mapping | null;
  storageMapping: Mapping | null;
  vms: SourceVM[];
  hooksDetails: IHookDetails[] | null;
  isNewNamespace?: boolean;
}

export const PlanDetails: React.FunctionComponent<IPlanDetailsProps> = ({
  plan,
  sourceProvider,
  networkMapping,
  storageMapping,
  vms,
  hooksDetails,
  isNewNamespace = false,
}: IPlanDetailsProps) => {
  const warmCriticalConcernsFound = plan.spec.warm
    ? warmCriticalConcerns.filter((label) => someVMHasConcern(vms as SourceVM[], label))
    : [];

  const hookStepPostfix = plan.spec.warm ? 'cutover' : 'migration';

  return (
    <DescriptionList isHorizontal>
      <DescriptionListGroup>
        <DescriptionListTerm>Plan name</DescriptionListTerm>
        <DescriptionListDescription id="details-plan-name">
          {plan.metadata.name}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {plan.spec.description ? (
        <DescriptionListGroup>
          <DescriptionListTerm id="plan-description-label">Plan description</DescriptionListTerm>
          <DescriptionListDescription
            id="details-plan-description"
            aria-labelledby="plan-description-label"
          >
            {plan.spec.description}
          </DescriptionListDescription>
        </DescriptionListGroup>
      ) : null}
      <DescriptionListGroup>
        <DescriptionListTerm id="source-provider-label">Source provider</DescriptionListTerm>
        <DescriptionListDescription
          id="details-source-provider"
          aria-labelledby="source-provider-label"
        >
          {plan.spec.provider.source.name}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm id="target-provider-label">Target provider</DescriptionListTerm>
        <DescriptionListDescription
          id="details-target-provider"
          aria-labelledby="target-provider-label"
        >
          {plan.spec.provider.destination.name}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm id="target-namespace-label">Target namespace</DescriptionListTerm>
        <DescriptionListDescription
          id="details-target-namespace"
          aria-labelledby="target-namespace-label"
        >
          {plan.spec.targetNamespace}
        </DescriptionListDescription>
        {isNewNamespace ? (
          <TextContent>
            <Text component="small" id="details-new-target-namespace-message">
              This is a new namespace that will be created when the plan is started.
            </Text>
          </TextContent>
        ) : null}
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm id="transfer-network-label">
          Migration transfer network
        </DescriptionListTerm>
        <DescriptionListDescription
          id="details-transfer-network"
          aria-labelledby="transfer-network-label"
        >
          {plan.spec.transferNetwork?.name || POD_NETWORK.name}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Selected VMs</DescriptionListTerm>
        <DescriptionListDescription>
          <Popover
            headerContent={<div>Selected VMs</div>}
            bodyContent={
              <List id="details-selected-vms-list">
                {vms.map((vm, idx) => (
                  <li key={idx}>
                    <VMNameWithPowerState vm={vm} sourceProvider={sourceProvider} />
                  </li>
                ))}
              </List>
            }
          >
            <Button variant="link" isInline id="details-selected-vms-count">
              {plan.spec.vms.length}
            </Button>
          </Popover>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm id="network-mapping-label">
          Network mapping{' '}
          {networkMapping ? (
            <MappingStatus
              className={spacing.mlXs}
              mappingType={MappingType.Network}
              mapping={networkMapping}
              isLabel={false}
              disableOk={true}
            />
          ) : null}
        </DescriptionListTerm>
        <DescriptionListDescription
          id="details-network-mapping"
          aria-labelledby="network-mapping-label"
        >
          <MappingDetailView
            mappingType={MappingType.Network}
            sourceProviderType={sourceProvider?.type || 'vsphere'}
            mapping={networkMapping}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm id="storage-mapping-label">
          Storage mapping{' '}
          {storageMapping ? (
            <MappingStatus
              className={spacing.mlXs}
              mappingType={MappingType.Storage}
              mapping={storageMapping}
              isLabel={false}
              disableOk={true}
            />
          ) : null}
        </DescriptionListTerm>
        <DescriptionListDescription
          id="details-storage-mapping"
          aria-labelledby="storage-mapping-label"
        >
          <MappingDetailView
            mappingType={MappingType.Storage}
            sourceProviderType={sourceProvider?.type || 'vsphere'}
            mapping={storageMapping}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm id="migration-type-label">
          Migration type{' '}
          {warmCriticalConcernsFound.length > 0 ? (
            <Popover
              hasAutoWidth
              bodyContent={
                <>
                  <Text>
                    Warm migration will fail for one or more VMs because of the following
                    conditions:
                  </Text>
                  <List className={`${spacing.mtSm} ${spacing.mlMd}`}>
                    {warmCriticalConcernsFound.map((label) => (
                      <ListItem key={label}>{label}</ListItem>
                    ))}
                  </List>
                </>
              }
            >
              <Button variant="link" isInline>
                <StatusIcon status="Error" className={spacing.mlXs} />
              </Button>
            </Popover>
          ) : null}
        </DescriptionListTerm>
        <DescriptionListDescription
          id="details-migration-type"
          aria-labelledby="migration-type-label"
        >
          {plan.spec.warm ? 'Warm' : 'Cold'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm id="migration-hooks-label">Hooks</DescriptionListTerm>
        <DescriptionListDescription id="details-plan-hooks" aria-labelledby="migration-hooks-label">
          {hooksDetails && hooksDetails?.length > 0 ? (
            <Grid>
              <GridItem span={5} id="migration-plan-hooks-steps-label">
                <Text className={text.fontWeightBold}>Migration step</Text>
                {hooksDetails.map((hookDetail) => (
                  <Text key={hookDetail.step}>
                    {hookDetail.step === 'PreHook'
                      ? `Pre-${hookStepPostfix}`
                      : `Post-${hookStepPostfix}`}
                  </Text>
                ))}
              </GridItem>
              <GridItem span={2} className="migration-hooks-align" />
              <GridItem span={5} id="migration-plan-hooks-definition-label">
                <Text className={text.fontWeightBold}>Definition</Text>
                {hooksDetails.map((hookDetails, idx) => (
                  <Text key={idx}>
                    {hookDetails.playbook ? 'Ansible playbook' : 'Custom container image'}
                  </Text>
                ))}
              </GridItem>
            </Grid>
          ) : (
            'None'
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};
