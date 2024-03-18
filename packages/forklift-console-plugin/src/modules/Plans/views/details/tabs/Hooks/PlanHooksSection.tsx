import React, { ReactNode, useReducer } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/hljs/yaml';
import a11yLight from 'react-syntax-highlighter/dist/cjs/styles/hljs/a11y-light';
import { Base64 } from 'js-base64';
import { useForkliftTranslation } from 'src/utils/i18n';

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
  Popover,
} from '@patternfly/react-core';
import Pencil from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { hasPlanEditable } from '../../utils';
import { canDeleteAndPatchPlanHooks } from '../../utils/canDeleteAndPatchPlan';

SyntaxHighlighter.registerLanguage('yaml', yaml);

interface planHook {
  hook: V1beta1Hook;
  step: 'PreHook' | 'PostHook';
}

interface PlanHooksSectionState {
  edit: boolean;
  dataChanged: boolean;
  alertMessage: ReactNode;
}

type PlanHooksSectionProps = {
  plan: V1beta1Plan;
  planHooks: V1beta1Hook[];
};

export const PlanHooksSection: React.FC<PlanHooksSectionProps> = ({ plan, planHooks }) => {
  const { t } = useForkliftTranslation();

  const initialState: PlanHooksSectionState = {
    edit: false,
    dataChanged: false,
    alertMessage: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

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

  const AddVmHookToList = (
    VmHook: V1beta1PlanSpecVmsHooks,
    planHooks: V1beta1Hook[],
    planHooksList: planHook[],
  ): boolean => {
    const foundVmHookInPlan = planHooks.find(
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

  const getPlanHooksList = (
    planVms: V1beta1PlanSpecVms[],
    planHooks: V1beta1Hook[],
  ): planHook[] => {
    const planHooksList: planHook[] = [];

    planVms?.filter((vm) =>
      vm.hooks?.filter((VmHook) => AddVmHookToList(VmHook, planHooks, planHooksList)),
    );
    return planHooksList.sort((a, b) => (a.step === 'PreHook' && b.step === 'PostHook' ? -1 : 1));
  };

  const PlanMappingsSectionEditMode: React.FC = () => {
    return (
      <>
        <Drawer></Drawer>
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
                        'Adding hooks to the plan is optional. Hooks are contained in Ansible playbooks that can be run before or after the migration.',
                      )}
                </HelperTextItem>
                <Divider />
              </HelperText>
            </FlexItem>
          )}
          {planHooks.length === 0 ? (
            <HelperText className="forklift-page-plan-details-hooks-msg">
              <HelperTextItem variant="indeterminate">
                {t('No hooks have been added to this migration plan.')}
              </HelperTextItem>
            </HelperText>
          ) : (
            <TableComposable className="forklift-page-plan-details-hooks-section">
              <Thead>
                <Tr>
                  <Th>Hook</Th>
                  <Th>Migration step</Th>
                  <Th>Type</Th>
                  <Th>Definition</Th>
                </Tr>
              </Thead>
              <Tbody>
                {getPlanHooksList(plan?.spec?.vms, planHooks).map((planHook, i) => (
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
                            View YAML
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
          <Button variant="secondary" onClick={onCancel}>
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>
      <HelperText className="forklift-section-plan-helper-text">
        <HelperTextItem variant="indeterminate">
          {t('Click the relevant buttons within the table for managing the plan hooks.')}
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
