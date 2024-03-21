import React, { useEffect, useReducer } from 'react';
import { Base64 } from 'js-base64';
import SectionHeading from 'src/components/headers/SectionHeading';
import { deepCopy } from 'src/modules/Plans/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Hook, V1beta1Plan } from '@kubev2v/types';
import { CodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  Divider,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  PageSection,
  Switch,
  TextInput,
} from '@patternfly/react-core';

import { Suspend } from '../../components';

import { usePlanHooks } from './hooks';
import { formReducer, FormState } from './state';
import { onUpdatePlanHooks } from './utils';

const preHookTemplate = (plan: V1beta1Plan) => ({
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: '' },
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: { name: `${plan?.metadata?.name}-pre-hook`, namespace: plan?.metadata?.namespace },
});

const postHookTemplate = (plan: V1beta1Plan) => ({
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: '' },
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: { name: `${plan?.metadata?.name}-post-hook`, namespace: plan?.metadata?.namespace },
});

const initialState = (
  plan: V1beta1Plan,
  preHookResource: V1beta1Hook,
  postHookResource: V1beta1Hook,
): FormState => ({
  preHookSet: !!preHookResource,
  postHookSet: !!postHookResource,
  preHook: deepCopy(preHookResource) || preHookTemplate(plan),
  postHook: deepCopy(postHookResource) || postHookTemplate(plan),
  hasChanges: false,
  isLoading: false,
  alertMessage: undefined,
});

export const SimpleHooks: React.FC<{ name: string; namespace: string }> = ({ name, namespace }) => {
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

  const HooksTabAction = (
    <Flex className="forklift-page-plan-details-vm-status__actions">
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
        <Button
          variant="secondary"
          isDisabled={!state.hasChanges}
          onClick={() =>
            dispatch({
              type: 'INIT',
              payload: initialState(plan, preHookResource, postHookResource),
            })
          }
        >
          {t('Cancel')}
        </Button>
      </FlexItem>
    </Flex>
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
        <Divider />
      </PageSection>

      <PageSection variant="light">
        <SectionHeading text={t('Pre migration hook')} />
        <Form>
          <FormGroup label="Enable hook" isRequired fieldId="pre-hook-set">
            <Switch
              id="pre-hook-set"
              label="Enable pre migration hook"
              labelOff="Do not enable a pre migration hook"
              isChecked={state.preHookSet}
              onChange={(value) => dispatch({ type: 'PRE_HOOK_SET', payload: value })}
            />
          </FormGroup>

          {state.preHookSet && (
            <>
              <FormGroup label="Hook runner image" isRequired fieldId="pre-hook-image">
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
              </FormGroup>
              <FormGroup label="Ansible playbook" fieldId="pre-hook-image">
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
              </FormGroup>
            </>
          )}
        </Form>
      </PageSection>

      <PageSection variant="light">
        <SectionHeading text={t('Post migration hook')} />
        <Form>
          <FormGroup label="Enable hook" isRequired fieldId="post-hook-set">
            <Switch
              id="post-hook-set"
              label="Enable post migration hook"
              labelOff="Do not enable a post migration hook"
              isChecked={state.postHookSet}
              onChange={(value) => dispatch({ type: 'POST_HOOK_SET', payload: value })}
            />
          </FormGroup>

          {state.postHookSet && (
            <>
              <FormGroup label="Hook runner image" isRequired fieldId="post-hook-image">
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
              </FormGroup>
              <FormGroup label="Ansible playbook" fieldId="post-hook-image">
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
              </FormGroup>
            </>
          )}
        </Form>
      </PageSection>
    </Suspend>
  );
};
