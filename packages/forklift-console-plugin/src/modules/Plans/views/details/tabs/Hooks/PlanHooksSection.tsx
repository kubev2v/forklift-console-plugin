import React, { ReactNode, useReducer, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/hljs/yaml';
import a11yLight from 'react-syntax-highlighter/dist/cjs/styles/hljs/a11y-light';
import { Base64 } from 'js-base64';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  HookModelGroupVersionKind,
  V1beta1Hook,
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1PlanSpecVmsHooks,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  Button,
  Divider,
  Drawer,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
  Popover,
} from '@patternfly/react-core';
import Pencil from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { hasPlanEditable, hasPlanHooksChanged, patchPlanHooksData } from '../../utils';
import { canDeleteAndPatchPlanHooks } from '../../utils/canDeleteAndPatchPlan';

import { PlanAddHookModal } from './PlanAddHookModal';

SyntaxHighlighter.registerLanguage('yaml', yaml);

export interface PlanHook {
  hook: V1beta1Hook;
  step: 'PreHook' | 'PostHook';
}

/**
 * Represents the state (edit/view) of the Plan hooks section.
 *
 * @typedef {Object} PlanHooksSectionState
 * @property {boolean} edit - Determines whether the MappingsSectionFields is currently being edited.
 * @property {ReactNode} alertMessage - The message to display when a validation error occurs.
 * @property {V1beta1Hook[]} updatedPlanHooks - The new version of the Plan Hooks Maps being edited.
 */
interface PlanHooksSectionState {
  edit: boolean;
  dataChanged: boolean;
  alertMessage: ReactNode;
  updatedPlanHooks: PlanHook[];
}

type PlanHooksSectionProps = {
  plan: V1beta1Plan;
  hooks: V1beta1Hook[];
};

export const PlanHooksSection: React.FC<PlanHooksSectionProps> = ({ plan, hooks }) => {
  const { t } = useForkliftTranslation();

  const getPlanHooksList = (planVms: V1beta1PlanSpecVms[], hooks: V1beta1Hook[]): PlanHook[] => {
    const planHooksList: PlanHook[] = [];

    planVms?.filter((vm) =>
      vm.hooks?.filter((VmHook) => AddVmHookToList(VmHook, hooks, planHooksList)),
    );
    return planHooksList.sort((a, b) => (a.step === 'PreHook' && b.step === 'PostHook' ? -1 : 1));
  };

  const AddVmHookToList = (
    VmHook: V1beta1PlanSpecVmsHooks,
    hooks: V1beta1Hook[],
    planHooksList: PlanHook[],
  ): boolean => {
    const foundVmHookInPlan = hooks.find(
      (hook) =>
        hook.metadata?.name === VmHook.hook.name &&
        hook.metadata?.namespace === VmHook.hook.namespace,
    );
    const alreadyExistInList = planHooksList.find(
      (hook) =>
        hook.hook.metadata?.name === VmHook.hook.name &&
        hook.hook.metadata?.namespace === VmHook.hook.namespace &&
        hook.step === VmHook.step,
    );

    if (!foundVmHookInPlan || alreadyExistInList) return false; // TODO: set an error message to state.alertMessage for this invalid state
    if (VmHook.step !== 'PreHook' && VmHook.step !== 'PostHook') return false; // TODO: set an error message to state.alertMessage for this invalid state

    planHooksList.push({ hook: foundVmHookInPlan, step: VmHook.step });
    return true;
  };

  const initialState: PlanHooksSectionState = {
    edit: false,
    dataChanged: false,
    alertMessage: null,
    updatedPlanHooks: getPlanHooksList(plan?.spec?.vms, hooks),
  };

  const [isLoading, setIsLoading] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isRemoveModalOpen, toggleRemoveModal] = React.useReducer((isOpen) => !isOpen, false);
  const [isAddModalOpen, toggleAddModal] = React.useReducer((isOpen) => !isOpen, false);
  const [hookBeingRemoved, setHookBeingRemoved] = React.useState<PlanHook | null>(null);
  const [hookBeingAdded, setHookBeingAdded] = React.useState<PlanHook | null>(null);

  function reducer(
    state: PlanHooksSectionState,
    action: { type: string; payload? },
  ): PlanHooksSectionState {
    switch (action.type) {
      case 'TOGGLE_EDIT': {
        return { ...state, edit: !state.edit };
      }
      case 'SET_CANCEL': {
        const dataChanged = false;

        return {
          ...state,
          dataChanged,
          alertMessage: null,
          updatedPlanHooks: getPlanHooksList(plan.spec?.vms, hooks),
        };
      }
      case 'ON_REMOVE_HOOK': {
        const updatedPlanHooks: PlanHook[] = action.payload.newState;

        const dataChanged = hasPlanHooksChanged(initialState.updatedPlanHooks, updatedPlanHooks);

        return {
          ...state,
          dataChanged,
          alertMessage: null,
          updatedPlanHooks,
        };
      }
      case 'SET_ALERT_MESSAGE': {
        return { ...state, alertMessage: action.payload };
      }
      default:
        return state;
    }
  }

  // Toggles between view and edit modes
  function onToggleEdit() {
    dispatch({ type: 'TOGGLE_EDIT' });
  }

  // Handle user clicking "cancel"
  function onCancel() {
    // clear changes and return to view mode
    dispatch({ type: 'SET_CANCEL' });
    dispatch({ type: 'TOGGLE_EDIT' });
  }

  const onRemoveHook = (hookBeingRemoved: PlanHook) => {
    state.updatedPlanHooks = state.updatedPlanHooks?.filter((i) => i !== hookBeingRemoved);
    const newState: PlanHook[] = [...state.updatedPlanHooks];

    dispatch({
      type: 'ON_REMOVE_HOOK',
      payload: { newState },
    });
  };

  async function onUpdate() {
    setIsLoading(true);

    // calculate removed hooks
    const removedHooks = initialState.updatedPlanHooks
      .filter(
        (initHook) =>
          !state.updatedPlanHooks.find((updatedHook) => initHook.hook === updatedHook.hook),
      )
      .map((hook) => hook.hook);

    // calculated updated VMs hooks
    const updatedPlanVmHooks: V1beta1PlanSpecVmsHooks[] = [];
    plan.spec?.vms.find((vm) =>
      vm.hooks?.filter((vmHook: V1beta1PlanSpecVmsHooks) =>
        removedHooks.find((removedHook) => {
          if (
            vmHook.hook.name !== removedHook.metadata?.name ||
            vmHook.hook.namespace !== removedHook.metadata?.namespace
          ) {
            updatedPlanVmHooks.push(vmHook);
          }
        }),
      ),
    );

    const planVms: V1beta1PlanSpecVms[] = plan.spec?.vms ? [...plan.spec.vms] : [];
    for (let i = 0; i < plan.spec?.vms.length; i++) {
      planVms[i] = {
        hooks: updatedPlanVmHooks,
        id: plan.spec?.vms[i].id,
      };
    }

    try {
      await patchPlanHooksData(plan, removedHooks, planVms);

      // clear changes and return to view mode
      dispatch({ type: 'SET_CANCEL' });
      dispatch({ type: 'TOGGLE_EDIT' });
      setIsLoading(false);
    } catch (err) {
      dispatch({
        type: 'SET_ALERT_MESSAGE',
        payload: err.message || err.toString(),
      });

      setIsLoading(false);
      return;
    }
  }

  const PlanMappingsSectionEditMode: React.FC = () => {
    return (
      <>
        <Drawer>
          {state.updatedPlanHooks.length === 0 ? (
            <HelperText className="forklift-page-plan-details-hooks-msg">
              <HelperTextItem variant="indeterminate">
                {t('No hooks have been added to this migration plan.')}
              </HelperTextItem>
            </HelperText>
          ) : (
            <TableComposable className="forklift-page-plan-details-hooks-section">
              <Thead>
                <Tr>
                  <Th>{t('Hook')}</Th>
                  <Th>{t('Migration step')}</Th>
                  <Th>{t('Type')}</Th>
                  <Th>{t('Definition')}</Th>
                  <Th aria-label="Actions"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {state.updatedPlanHooks.map((planHook, i) => (
                  <Tr key={`${planHook.step}-${i}`}>
                    <Td>
                      <ResourceLink
                        groupVersionKind={HookModelGroupVersionKind}
                        name={planHook.hook.metadata?.name}
                        namespace={planHook.hook.metadata?.namespace}
                      />
                    </Td>
                    <Td>
                      {planHook.step === 'PreHook' ? t(`Pre-migration`) : t(`Post-migration`)}
                    </Td>

                    <Td>
                      {planHook.hook.spec?.playbook ? 'Ansible playbook' : 'Custom container image'}
                    </Td>

                    <Td>
                      {planHook.hook.spec?.playbook ? (
                        <Popover
                          className="forklift-page-plan-details-hooks.playbook-yaml-popover"
                          aria-label="Playbook YAML contents"
                          hasAutoWidth
                          bodyContent={
                            <SyntaxHighlighter language="yaml" style={a11yLight}>
                              {Base64.decode(planHook.hook.spec.playbook)}
                            </SyntaxHighlighter>
                          }
                        >
                          <Button variant="link" isInline>
                            {t('View playbook')}
                          </Button>
                        </Popover>
                      ) : (
                        planHook.hook.spec?.image
                      )}
                    </Td>
                    <Td modifier="fitContent">
                      <Button
                        variant="plain"
                        aria-label="Remove"
                        onClick={() => {
                          setHookBeingRemoved(planHook);
                          toggleRemoveModal();
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </TableComposable>
          )}
          <React.Fragment>
            <Modal
              variant={ModalVariant.small}
              title={t('Permanently remove hook?')}
              isOpen={isRemoveModalOpen}
              onClose={toggleRemoveModal}
              actions={[
                <Button
                  key="Remove"
                  variant="primary"
                  onClick={() => {
                    onRemoveHook(hookBeingRemoved);
                    toggleRemoveModal();
                  }}
                >
                  {t('Remove')}
                </Button>,
                <Button key="cancel" variant="link" onClick={toggleRemoveModal}>
                  {t('Cancel')}
                </Button>,
              ]}
            >
              <ForkliftTrans>
                This hook <strong>{hookBeingRemoved?.hook.metadata?.name || ''}</strong> will not be
                executed when you run your migration plan.
              </ForkliftTrans>
            </Modal>
          </React.Fragment>
          {isAddModalOpen ? (
            <PlanAddHookModal
              SetHookBeingAdded={setHookBeingAdded}
              onClose={() => {
                toggleAddModal();
              }}
              onSave={(newHookInstance: PlanHook) => {
                // onSaveHook(hookBeingAdded); // TODO
                toggleAddModal();
              }}
              hookBeingAdded={hookBeingAdded}
            />
          ) : null}
        </Drawer>
      </>
    );
  };

  const PlanHooksSectionViewMode: React.FC = () => {
    const { t } = useForkliftTranslation();
    const DisableEditHooks = !hasPlanEditable(plan);

    return (
      <>
        <Drawer>
          {canDeleteAndPatchPlanHooks(plan) && (
            <FlexItem>
              <Button
                variant="secondary"
                icon={<Pencil />}
                onClick={onToggleEdit}
                isDisabled={DisableEditHooks}
              >
                {t('Edit hooks')}
              </Button>
              <HelperText className="forklift-section-plan-helper-text">
                <HelperTextItem variant="indeterminate">
                  {DisableEditHooks
                    ? t(
                        'The edit hooks button is disabled if the plan started running and at least one virtual machine was migrated successfully.',
                      )
                    : t(
                        'Adding hooks to the plan is OPTIONAL. Hooks are contained in Ansible playbooks that can be run before or after the migration.',
                      )}
                </HelperTextItem>
                <Divider />
              </HelperText>
            </FlexItem>
          )}
          {state.updatedPlanHooks.length === 0 ? (
            <HelperText className="forklift-page-plan-details-hooks-msg">
              <HelperTextItem variant="indeterminate">
                {t('No hooks have been added to this migration plan.')}
              </HelperTextItem>
            </HelperText>
          ) : (
            <TableComposable className="forklift-page-plan-details-hooks-section">
              <Thead>
                <Tr>
                  <Th>{t('Hook')}</Th>
                  <Th>{t('Migration step')}</Th>
                  <Th>{t('Type')}</Th>
                  <Th>{t('Definition')}</Th>
                  <Th aria-label="Actions"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {state.updatedPlanHooks.map((planHook, i) => (
                  <Tr key={`${planHook.step}-${i}`}>
                    <Td>
                      <ResourceLink
                        groupVersionKind={HookModelGroupVersionKind}
                        name={planHook.hook.metadata?.name}
                        namespace={planHook.hook.metadata?.namespace}
                      />
                    </Td>
                    <Td>
                      {planHook.step === 'PreHook' ? t(`Pre-migration`) : t(`Post-migration`)}
                    </Td>

                    <Td>
                      {planHook.hook.spec?.playbook
                        ? t('Ansible playbook')
                        : t('Custom container image')}
                    </Td>

                    <Td>
                      {planHook.hook.spec?.playbook ? (
                        <Popover
                          className="forklift-page-plan-details-hooks.playbook-yaml-popover"
                          aria-label="Playbook YAML contents"
                          hasAutoWidth
                          bodyContent={
                            <SyntaxHighlighter language="yaml" style={a11yLight}>
                              {Base64.decode(planHook.hook.spec.playbook)}
                            </SyntaxHighlighter>
                          }
                        >
                          <Button variant="link" isInline>
                            {t('View playbook')}
                          </Button>
                        </Popover>
                      ) : (
                        planHook.hook.spec?.image
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </TableComposable>
          )}
        </Drawer>
      </>
    );
  };

  return state.edit ? (
    // Edit mode
    <>
      <Flex>
        <FlexItem>
          <Button
            variant="primary"
            onClick={onUpdate}
            isDisabled={!state.dataChanged}
            isLoading={isLoading}
          >
            {t('Update hooks')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={toggleAddModal}>
            {t('Add hook')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={onCancel}>
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>
      <HelperText className="forklift-section-plan-helper-text">
        <HelperTextItem variant="indeterminate">
          {t(
            'Click the update hooks button to save your changes, button is disabled until a change is detected.',
          )}
        </HelperTextItem>
      </HelperText>
      <Divider />
      {state.alertMessage ? (
        <>
          <Alert
            className="co-alert forklift-alert--margin-top"
            isInline
            variant="danger"
            title={t('Error')}
          >
            {state.alertMessage?.toString()}
          </Alert>
        </>
      ) : null}
      <PlanMappingsSectionEditMode />
    </>
  ) : (
    // View mode
    <>
      <PlanHooksSectionViewMode />
    </>
  );
};
