import * as React from 'react';
import * as yup from 'yup';
import {
  Breadcrumb,
  BreadcrumbItem,
  Level,
  LevelItem,
  PageSection,
  Title,
  Wizard,
  WizardStep,
  WizardStepFunctionType,
} from '@patternfly/react-core';
import { Redirect, useHistory, useRouteMatch } from 'react-router-dom';
import { UseQueryResult } from 'react-query';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFormField, useFormState } from '@migtools/lib-ui';
import { RouteGuard } from '@app/common/components/RouteGuard';
import { WizardStepContainer } from './WizardStepContainer';
import { GeneralForm } from './GeneralForm';
import { FilterVMsForm } from './FilterVMsForm';
import { SelectVMsForm } from './SelectVMsForm';
import { MappingForm } from './MappingForm';
import { TypeForm } from './TypeForm';
import { HooksForm } from './HooksForm';
import { Review } from './Review';
import {
  IOpenShiftProvider,
  IPlan,
  Mapping,
  MappingType,
  PlanType,
  SourceInventoryProvider,
  InventoryTree,
  InventoryTreeType,
  IVMwareFolderTree,
} from '@app/queries/types';
import {
  IMappingBuilderItem,
  mappingBuilderItemsSchema,
} from '@app/Mappings/components/MappingBuilder';
import { generateMappings, usePlanWizardPrefillEffect } from './helpers';
import {
  getMappingNameSchema,
  useMappingsQuery,
  getPlanNameSchema,
  useCreatePlanMutation,
  usePatchPlanMutation,
  usePlansQuery,
  useCreateMappingMutations,
  useSourceVMsQuery,
  useInventoryTreeQuery,
  IndexedTree,
} from '@app/queries';
import { getAggregateQueryStatus } from '@app/queries/helpers';
import { dnsLabelNameSchema, PATH_PREFIX, PLANS_REFERENCE } from '@app/common/constants';
import { IKubeList } from '@app/client/types';
import { LoadingEmptyState } from '@app/common/components/LoadingEmptyState';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { PlanHookInstance } from './PlanAddEditHookModal';

import './PlanWizard.css';
import { LONG_LOADING_MESSAGE } from '@app/queries/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { createK8sPath } from '_/utils/resources';

export type PlanWizardMode = 'create' | 'edit' | 'duplicate';

const useMappingFormState = (mappingsQuery: UseQueryResult<IKubeList<Mapping>>) => {
  const isSaveNewMapping = useFormField(false, yup.boolean().required());
  const newMappingNameSchema = getMappingNameSchema(mappingsQuery, null).label('Name');
  return useFormState({
    isCreateMappingSelected: useFormField(false, yup.boolean().required()),
    selectedExistingMapping: useFormField<Mapping | null>(null, yup.mixed<Mapping | null>()),
    builderItems: useFormField<IMappingBuilderItem[]>([], mappingBuilderItemsSchema),
    isSaveNewMapping,
    newMappingName: useFormField(
      '',
      isSaveNewMapping.value ? newMappingNameSchema.required() : yup.string()
    ),
    isPrefilled: useFormField(false, yup.boolean()),
  });
};

const usePlanWizardFormState = (
  plansQuery: UseQueryResult<IKubeList<IPlan>>,
  networkMappingsQuery: UseQueryResult<IKubeList<Mapping>>,
  storageMappingsQuery: UseQueryResult<IKubeList<Mapping>>,
  planBeingPrefilled: IPlan | null,
  wizardMode: PlanWizardMode
) => {
  const forms = {
    general: useFormState({
      planName: useFormField(
        '',
        getPlanNameSchema(plansQuery, planBeingPrefilled, wizardMode).label('Plan name').required()
      ),
      planDescription: useFormField('', yup.string().label('Plan description').defined()),
      sourceProvider: useFormField<SourceInventoryProvider | null>(
        null,
        yup.mixed<SourceInventoryProvider>().label('Source provider').required()
      ),
      targetProvider: useFormField<IOpenShiftProvider | null>(
        null,
        yup.mixed<IOpenShiftProvider>().label('Target provider').required()
      ),
      targetNamespace: useFormField('', dnsLabelNameSchema.label('Target namespace').required()),
      migrationNetwork: useFormField<string | null>(
        null,
        yup.mixed<string>().label('Migration network')
      ),
    }),
    filterVMs: useFormState({
      treeType: useFormField<InventoryTreeType>(
        InventoryTreeType.Cluster,
        yup.mixed<InventoryTreeType>()
      ),
      selectedTreeNodes: useFormField<InventoryTree[]>(
        [],
        yup.array<InventoryTree>().required().min(1)
      ),
      isPrefilled: useFormField(false, yup.boolean()),
    }),
    selectVMs: useFormState({
      selectedVMIds: useFormField<string[]>(
        [],
        yup.array(yup.string().default('')).required().min(1)
      ),
    }),
    networkMapping: useMappingFormState(networkMappingsQuery),
    storageMapping: useMappingFormState(storageMappingsQuery),
    type: useFormState({
      type: useFormField<PlanType>('Cold', yup.mixed().oneOf(['Cold', 'Warm']).required()),
    }),
    hooks: useFormState({
      instances: useFormField<PlanHookInstance[]>([], yup.array<PlanHookInstance>()),
    }),
  };

  return {
    ...forms,
    isSomeFormDirty: (Object.keys(forms) as (keyof typeof forms)[]).some(
      (key) => forms[key].isDirty
    ),
  };
};

export type PlanWizardFormState = ReturnType<typeof usePlanWizardFormState>; // ✨ Magic

export const PlanWizard: React.FunctionComponent = () => {
  const history = useHistory();
  const plansQuery = usePlansQuery();
  const networkMappingsQuery = useMappingsQuery(MappingType.Network);
  const storageMappingsQuery = useMappingsQuery(MappingType.Storage);

  const editRouteMatch = useRouteMatch<{ planName: string }>({
    path: `${PATH_PREFIX}/plans/:planName/edit`,
    strict: true,
    sensitive: true,
  });
  const duplicateRouteMatch = useRouteMatch<{ planName: string }>({
    path: `${PATH_PREFIX}/plans/:planName/duplicate`,
    strict: true,
    sensitive: true,
  });
  const wizardMode = editRouteMatch ? 'edit' : duplicateRouteMatch ? 'duplicate' : 'create';

  const prefillPlanName = editRouteMatch?.params.planName || duplicateRouteMatch?.params.planName;
  const planBeingPrefilled =
    plansQuery.data?.items.find((plan) => plan.metadata.name === prefillPlanName) || null;

  const forms = usePlanWizardFormState(
    plansQuery,
    networkMappingsQuery,
    storageMappingsQuery,
    planBeingPrefilled,
    wizardMode
  );

  const vmsQuery = useSourceVMsQuery(forms.general.values.sourceProvider);

  const { isDonePrefilling, prefillQueries, prefillErrorTitles } = usePlanWizardPrefillEffect(
    forms,
    planBeingPrefilled,
    wizardMode
  );

  enum StepId {
    General = 0,
    FilterVMs,
    SelectVMs,
    NetworkMapping,
    StorageMapping,
    Type,
    Hooks,
    Review,
  }

  const stepForms = [
    forms.general,
    forms.filterVMs,
    forms.selectVMs,
    forms.networkMapping,
    forms.storageMapping,
    forms.type,
    forms.hooks,
  ];
  const firstInvalidFormIndex = stepForms.findIndex((form) => !form.isValid);
  const stepIdReached: StepId =
    firstInvalidFormIndex === -1 ? StepId.Review : firstInvalidFormIndex;

  const onClose = () => history.push(createK8sPath(PLANS_REFERENCE));

  const createPlanMutation = useCreatePlanMutation();
  const patchPlanMutation = usePatchPlanMutation();

  const { network: createSharedNetworkMapMutation, storage: createSharedStorageMapMutation } =
    useCreateMappingMutations();

  const createSharedMappings = async () => {
    const { networkMapping, storageMapping } = generateMappings({ forms });
    if (networkMapping && forms.networkMapping.values.isSaveNewMapping) {
      createSharedNetworkMapMutation.mutate(networkMapping);
    }
    if (storageMapping && forms.storageMapping.values.isSaveNewMapping) {
      createSharedStorageMapMutation.mutate(storageMapping);
    }
  };

  const onSave = () => {
    if (wizardMode === 'create' || wizardMode === 'duplicate') {
      createPlanMutation.mutate(forms);
    } else if (wizardMode === 'edit' && planBeingPrefilled) {
      patchPlanMutation.mutate({ planBeingEdited: planBeingPrefilled, forms });
    }
    createSharedMappings();
  };

  const allMutationResults = [
    !editRouteMatch ? createPlanMutation : patchPlanMutation,
    ...(forms.networkMapping.values.isSaveNewMapping ? [createSharedNetworkMapMutation] : []),
    ...(forms.storageMapping.values.isSaveNewMapping ? [createSharedStorageMapMutation] : []),
  ];
  const allMutationErrorTitles = [
    !editRouteMatch ? 'Cannot create migration plan' : 'Cannot save migration plan',
    ...(forms.networkMapping.values.isSaveNewMapping ? ['Cannot create network mapping'] : []),
    ...(forms.storageMapping.values.isSaveNewMapping ? ['Cannot create storage mapping'] : []),
  ];
  const mutationStatus = getAggregateQueryStatus(allMutationResults);

  React.useEffect(() => {
    if (mutationStatus === 'success') onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutationStatus]);

  const selectedVMs =
    vmsQuery.data?.findVMsByRefs(forms.selectVMs.values.selectedVMIds.map((id) => ({ id }))) || [];

  const clusterTreeQuery = useInventoryTreeQuery(
    forms.general.values.sourceProvider,
    InventoryTreeType.Cluster
  );
  const vmTreeQuery = useInventoryTreeQuery(
    forms.general.values.sourceProvider,
    InventoryTreeType.VM
  );

  const steps: WizardStep[] = [
    {
      id: StepId.General,
      name: 'General',
      component: (
        <WizardStepContainer title="General settings">
          <GeneralForm
            form={forms.general}
            wizardMode={wizardMode}
            afterProviderChange={() => {
              // When providers change, clear all forms containing provider-specific options
              forms.filterVMs.clear();
              forms.selectVMs.clear();
              forms.networkMapping.clear();
              forms.storageMapping.clear();
            }}
            afterTargetNamespaceChange={() => {
              // Network mapping targets are namespace-specific
              forms.networkMapping.clear();
            }}
          />
        </WizardStepContainer>
      ),
      enableNext: forms.general.isValid,
    },
    {
      name: 'VM selection',
      steps: [
        {
          id: StepId.FilterVMs,
          name: 'Filter',
          component: (
            <WizardStepContainer title="Filter by VM location">
              <FilterVMsForm
                treeQuery={
                  forms.filterVMs.values.treeType === InventoryTreeType.Cluster
                    ? clusterTreeQuery
                    : vmTreeQuery
                }
                form={forms.filterVMs}
                sourceProvider={forms.general.values.sourceProvider}
                planBeingPrefilled={planBeingPrefilled}
              />
            </WizardStepContainer>
          ),
          enableNext: forms.filterVMs.isValid,
          canJumpTo: stepIdReached >= StepId.FilterVMs,
        },
        {
          id: StepId.SelectVMs,
          name: 'Select VMs',
          component: (
            <WizardStepContainer title="Select VMs">
              <SelectVMsForm
                hostTreeQuery={clusterTreeQuery}
                vmTreeQuery={vmTreeQuery as UseQueryResult<IndexedTree<IVMwareFolderTree>, unknown>}
                form={forms.selectVMs}
                treeType={forms.filterVMs.values.treeType}
                selectedTreeNodes={forms.filterVMs.values.selectedTreeNodes}
                sourceProvider={forms.general.values.sourceProvider}
                selectedVMs={selectedVMs}
              />
            </WizardStepContainer>
          ),
          enableNext: forms.selectVMs.isValid,
          canJumpTo: stepIdReached >= StepId.SelectVMs,
        },
      ],
    },
    {
      id: StepId.NetworkMapping,
      name: 'Network mapping',
      component: (
        <WizardStepContainer title="Network mapping">
          <MappingForm
            key="mapping-form-network"
            form={forms.networkMapping}
            sourceProvider={forms.general.values.sourceProvider}
            targetProvider={forms.general.values.targetProvider}
            mappingType={MappingType.Network}
            targetNamespace={forms.general.values.targetNamespace}
            selectedVMs={selectedVMs}
            planBeingPrefilled={planBeingPrefilled}
          />
        </WizardStepContainer>
      ),
      enableNext: forms.networkMapping.isValid,
      canJumpTo: stepIdReached >= StepId.NetworkMapping,
    },
    {
      id: StepId.StorageMapping,
      name: 'Storage mapping',
      component: (
        <WizardStepContainer title="Storage mapping">
          <MappingForm
            key="mapping-form-storage"
            form={forms.storageMapping}
            sourceProvider={forms.general.values.sourceProvider}
            targetProvider={forms.general.values.targetProvider}
            mappingType={MappingType.Storage}
            targetNamespace={forms.general.values.targetNamespace}
            selectedVMs={selectedVMs}
            planBeingPrefilled={planBeingPrefilled}
          />
        </WizardStepContainer>
      ),
      enableNext: forms.storageMapping.isValid,
      canJumpTo: stepIdReached >= StepId.StorageMapping,
    },
    {
      id: StepId.Type,
      name: 'Type',
      component: (
        <WizardStepContainer title="Migration type">
          <TypeForm form={forms.type} selectedVMs={selectedVMs} />
        </WizardStepContainer>
      ),
      enableNext: forms.type.isValid,
      canJumpTo: stepIdReached >= StepId.Type,
    },
    {
      id: StepId.Hooks,
      name: 'Hooks',
      component: (
        <WizardStepContainer title="Add hooks to the plan (optional)">
          <HooksForm form={forms.hooks} isWarmMigration={forms.type.values.type === 'Warm'} />
        </WizardStepContainer>
      ),
      enableNext: forms.hooks.isValid,
      canJumpTo: stepIdReached >= StepId.Hooks,
    },
    {
      id: StepId.Review,
      name: 'Review',
      component: (
        <WizardStepContainer title="Review the migration plan">
          <Review
            forms={forms}
            allMutationResults={allMutationResults}
            allMutationErrorTitles={allMutationErrorTitles}
            wizardMode={wizardMode}
            selectedVMs={selectedVMs}
          />
        </WizardStepContainer>
      ),
      enableNext: mutationStatus === 'idle',
      nextButtonText: 'Finish',
      canJumpTo: stepIdReached >= StepId.Review,
    },
  ];

  const resetResultsOnNav: WizardStepFunctionType = (_newStep, prevStep) => {
    if (prevStep.prevId === StepId.Review) {
      allMutationResults.forEach((result) => result.reset());
    }
  };

  const wizardTitle = `${wizardMode === 'edit' ? 'Edit' : 'Create'} migration plan`;

  return (
    <ResolvedQueries
      results={[plansQuery, networkMappingsQuery, storageMappingsQuery, ...prefillQueries]}
      errorTitles={[
        'Cannot load plans',
        'Cannot load network mappings',
        'Cannot load storage mappings',
        ...prefillErrorTitles,
      ]}
      errorsInline={false}
      className={spacing.mMd}
      emptyStateBody={LONG_LOADING_MESSAGE}
    >
      {!isDonePrefilling ? (
        <LoadingEmptyState />
      ) : wizardMode === 'edit' &&
        (!planBeingPrefilled || planBeingPrefilled?.status?.migration?.started) ? (
        <Redirect to={createK8sPath(PLANS_REFERENCE)} />
      ) : (
        <>
          <RouteGuard
            when={forms.isSomeFormDirty && mutationStatus === 'idle'}
            title="Leave this page?"
            message="All unsaved changes will be lost."
          />
          <PageSection title={wizardTitle} variant="light">
            <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
              <BreadcrumbItem>
                <ResourceLink kind={PLANS_REFERENCE} hideIcon displayName="Migration plans" />
              </BreadcrumbItem>
              {planBeingPrefilled ? (
                <BreadcrumbItem>{planBeingPrefilled.metadata.name}</BreadcrumbItem>
              ) : null}
              <BreadcrumbItem>{wizardMode.replace(/^\w/, (c) => c.toUpperCase())}</BreadcrumbItem>
            </Breadcrumb>
            <Level>
              <LevelItem>
                <Title headingLevel="h1">{wizardTitle}</Title>
              </LevelItem>
            </Level>
          </PageSection>
          <PageSection variant="light" type="wizard">
            <Wizard
              steps={steps}
              onSubmit={(event) => event.preventDefault()}
              onSave={onSave}
              onClose={onClose}
              onBack={resetResultsOnNav}
              onGoToStep={resetResultsOnNav}
            />
          </PageSection>
        </>
      )}
    </ResolvedQueries>
  );
};
