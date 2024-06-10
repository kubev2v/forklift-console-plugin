import React, { useEffect, useReducer } from 'react';
import { Base64 } from 'js-base64';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { CodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  Divider,
  Flex,
  FlexItem,
  Form,
  HelperText,
  HelperTextItem,
  PageSection,
  Switch,
  TextInput,
} from '@patternfly/react-core';

import { Suspend } from '../../components';

import { usePlanHooks } from './hooks';
import { formReducer, initialState } from './state';
import { onUpdatePlanHooks } from './utils';

export const PlanHooks: React.FC<{ name: string; namespace: string }> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [plan, preHookResource, postHookResource, loaded, loadError] = usePlanHooks(
    name,
    namespace,
  );

  const [state, dispatch] = useReducer(
    formReducer,
    initialState(plan, preHookResource, postHookResource),
  );

  // Init state on outside changes
  useEffect(() => {
    dispatch({
      type: 'INIT',
      payload: initialState(plan, preHookResource, postHookResource),
    });
  }, [plan, preHookResource, postHookResource]);

  // Handle user clicking "save"
  async function onUpdate() {
    onUpdatePlanHooks({ plan, preHookResource, postHookResource, dispatch, state });
  }

  const onClick = () => {
    dispatch({
      type: 'INIT',
      payload: initialState(plan, preHookResource, postHookResource),
    });
  };

  const HooksTabAction = (
    <>
      <Flex>
        <FlexItem>
          <Button
            variant="primary"
            onClick={onUpdate}
            isDisabled={!state.hasChanges}
            isLoading={state.isLoading}
          >
            {t('Update hooks')}
          </Button>
        </FlexItem>

        <FlexItem>
          <Button variant="secondary" isDisabled={!state.hasChanges} onClick={onClick}>
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
    </>
  );

  return (
    <Suspend obj={plan} loaded={loaded} loadError={loadError}>
      {state.alertMessage && <PageSection variant="light">{state.alertMessage}</PageSection>}

      <PageSection
        variant="light"
        className="forklift-page-plan-details-vm-status__section-actions"
      >
        <SectionHeading text={t('Migration hook')} />
        {HooksTabAction}
      </PageSection>

      <PageSection variant="light">
        <SectionHeading text={t('Pre migration hook')} />
        <Form>
          <FormGroupWithHelpText label="Enable hook" isRequired fieldId="pre-hook-set">
            <Switch
              id="pre-hook-set"
              label="Enable pre migration hook"
              labelOff="Do not enable a pre migration hook"
              isChecked={state.preHookSet}
              onChange={(value) => dispatch({ type: 'PRE_HOOK_SET', payload: value })}
            />
          </FormGroupWithHelpText>

          {state.preHookSet && (
            <>
              <FormGroupWithHelpText label="Hook runner image" isRequired fieldId="pre-hook-image">
                <TextInput
                  value={state.preHook?.spec?.image}
                  type="url"
                  onChange={(value) => dispatch({ type: 'PRE_HOOK_IMAGE', payload: value })}
                  aria-label="pre hook image"
                />
                <HelperText>
                  <HelperTextItem>
                    You can use a custom hook-runner image or specify a custom image, for example
                    quay.io/konveyor/hook-runner .
                  </HelperTextItem>
                </HelperText>
              </FormGroupWithHelpText>
              <FormGroupWithHelpText label="Ansible playbook" fieldId="pre-hook-image">
                <CodeEditor
                  language="yaml"
                  value={Base64.decode(state.preHook?.spec?.playbook || '')}
                  onChange={(value) => dispatch({ type: 'PRE_HOOK_PLAYBOOK', payload: value })}
                  minHeight="400px"
                  showMiniMap={false}
                />
                <HelperText>
                  <HelperTextItem>
                    Optional: Ansible playbook. If you specify a playbook, the image must be
                    hook-runner.
                  </HelperTextItem>
                </HelperText>
              </FormGroupWithHelpText>
            </>
          )}
        </Form>
      </PageSection>

      <PageSection variant="light">
        <SectionHeading text={t('Post migration hook')} />
        <Form>
          <FormGroupWithHelpText label="Enable hook" isRequired fieldId="post-hook-set">
            <Switch
              id="post-hook-set"
              label="Enable post migration hook"
              labelOff="Do not enable a post migration hook"
              isChecked={state.postHookSet}
              onChange={(value) => dispatch({ type: 'POST_HOOK_SET', payload: value })}
            />
          </FormGroupWithHelpText>

          {state.postHookSet && (
            <>
              <FormGroupWithHelpText label="Hook runner image" isRequired fieldId="post-hook-image">
                <TextInput
                  value={state.postHook?.spec?.image}
                  type="url"
                  onChange={(value) => dispatch({ type: 'POST_HOOK_IMAGE', payload: value })}
                  aria-label="pre hook image"
                />
                <HelperText>
                  <HelperTextItem>
                    You can use a custom hook-runner image or specify a custom image, for example
                    quay.io/konveyor/hook-runner .
                  </HelperTextItem>
                </HelperText>
              </FormGroupWithHelpText>
              <FormGroupWithHelpText label="Ansible playbook" fieldId="post-hook-image">
                <CodeEditor
                  language="yaml"
                  value={Base64.decode(state.postHook?.spec?.playbook || '')}
                  onChange={(value) => dispatch({ type: 'POST_HOOK_PLAYBOOK', payload: value })}
                  minHeight="400px"
                  showMiniMap={false}
                />
                <HelperText>
                  <HelperTextItem>
                    Optional: Ansible playbook. If you specify a playbook, the image must be
                    hook-runner.
                  </HelperTextItem>
                </HelperText>
              </FormGroupWithHelpText>
            </>
          )}
        </Form>
      </PageSection>
    </Suspend>
  );
};
