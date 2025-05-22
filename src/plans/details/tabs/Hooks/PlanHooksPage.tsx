import { type FC, type FormEvent, useEffect, useReducer } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useForkliftTranslation } from 'src/utils/i18n';

import Suspend from '@components/Suspend';
import { Alert, Divider, PageSection } from '@patternfly/react-core';

import type { PlanPageProps } from '../../utils/types';

import HooksCodeEditor from './components/HooksCodeEditor';
import HooksTabActions from './components/HooksTabActions/HooksTabActions';
import { usePlanHooks } from './hooks/usePlanHooks';
import { initialState } from './state/initialState';
import { formReducer } from './state/reducer';
import { formActionKeys } from './state/types';
import { hookType } from './utils/constants';
import { onUpdatePlanHooks } from './utils/utils';

const PlanHooksPage: FC<PlanPageProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();

  const { postHookResource, preHookResource, warning } = usePlanHooks(plan);

  const [state, dispatch] = useReducer(
    formReducer,
    initialState(plan, preHookResource, postHookResource),
  );

  useEffect(() => {
    dispatch({
      payload: initialState(plan, preHookResource, postHookResource),
      type: formActionKeys.INIT,
    });
  }, [plan, preHookResource, postHookResource]);

  const onUpdate = async () => {
    await onUpdatePlanHooks({
      dispatch,
      plan,
      postHookResource: postHookResource!,
      preHookResource: preHookResource!,
      state,
    });
  };

  const onCancel = () => {
    dispatch({
      payload: initialState(plan, preHookResource, postHookResource),
      type: formActionKeys.INIT,
    });
  };

  const onChangePreHookSet: (checked: boolean, event: FormEvent<HTMLInputElement>) => void = (
    checked,
  ) => {
    dispatch({ payload: checked, type: formActionKeys.PRE_HOOK_SET });
  };

  const onChangePostHookSet: (checked: boolean, event: FormEvent<HTMLInputElement>) => void = (
    checked,
  ) => {
    dispatch({ payload: checked, type: formActionKeys.POST_HOOK_SET });
  };

  const onChangePreHookImage: (value: string, event: FormEvent<HTMLInputElement>) => void = (
    value,
  ) => {
    dispatch({ payload: value, type: formActionKeys.PRE_HOOK_IMAGE });
  };

  const onChangePreHookPlaybook: (value: string, event: FormEvent<HTMLInputElement>) => void = (
    value,
  ) => {
    dispatch({ payload: value, type: formActionKeys.PRE_HOOK_PLAYBOOK });
  };

  const onChangePostHookImage: (value: string, event: FormEvent<HTMLInputElement>) => void = (
    value,
  ) => {
    dispatch({ payload: value, type: formActionKeys.POST_HOOK_IMAGE });
  };

  const onChangePostHookPlaybook: (value: string, event: FormEvent<HTMLInputElement>) => void = (
    value,
  ) => {
    dispatch({ payload: value, type: formActionKeys.POST_HOOK_PLAYBOOK });
  };

  return (
    <Suspend obj={plan} loaded loadError={null}>
      <PageSection variant="light">
        <SectionHeading text={t('Hooks')} />
        {state.alertMessage && <>{state.alertMessage}</>}
        {warning && (
          <Alert variant="warning" title={t('The plan hooks were manually configured')}>
            <p>
              {t('Warning:')} {warning},
            </p>
            <p>{t('updating the hooks will override the current configuration.')}</p>
          </Alert>
        )}

        <SectionHeading text={t('Migration hook')} />
        <HooksTabActions onCancel={onCancel} onUpdate={onUpdate} plan={plan} state={state} />
        <Divider />

        <HooksCodeEditor
          hookType={hookType.PreHook}
          isHookSet={state.preHookSet}
          onChangeHookImage={onChangePreHookImage}
          onChangeHookPlaybook={onChangePreHookPlaybook}
          onChangeHookSet={onChangePreHookSet}
          planEditable={isPlanEditable(plan)}
          image={state.preHook?.spec?.image}
          playbook={state.preHook?.spec?.playbook}
        />

        <HooksCodeEditor
          hookType={hookType.PostHook}
          isHookSet={state.postHookSet}
          onChangeHookImage={onChangePostHookImage}
          onChangeHookPlaybook={onChangePostHookPlaybook}
          onChangeHookSet={onChangePostHookSet}
          planEditable={isPlanEditable(plan)}
          image={state.postHook?.spec?.image}
          playbook={state.postHook?.spec?.playbook}
        />
      </PageSection>
    </Suspend>
  );
};

export default PlanHooksPage;
