import { useCallback, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Stack, StackItem, TextInput } from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import type { PlanModalProps } from '../types';

import { useDuplicateModalResources } from './hooks/useDuplicateModalResources';
import { createDuplicatePlanAndMapResources } from './utils/utils';

const DuplicateModal: OverlayComponent<PlanModalProps> = ({ closeOverlay, plan }) => {
  const { t } = useForkliftTranslation();
  const name = getName(plan);
  const [newName, setNewName] = useState<string>(`copy-of-${name}`);

  const { configMap, networkMap, postHook, preHook, storageMap } = useDuplicateModalResources(plan);
  const isDuplicateDisabled = !networkMap || !storageMap;

  const onDuplicate = useCallback(async () => {
    if (!networkMap || !storageMap) {
      throw new Error('Required plan mappings are still loading.');
    }

    return createDuplicatePlanAndMapResources({
      configMap,
      networkMap,
      newPlanName: newName,
      plan,
      postHook,
      preHook,
      storageMap,
    });
  }, [configMap, networkMap, newName, plan, postHook, preHook, storageMap]);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Duplicate')}
      isDisabled={isDuplicateDisabled}
      onConfirm={onDuplicate}
      title={t('Duplicate migration plan')}
    >
      <ForkliftTrans>
        <Stack hasGutter>
          <StackItem>
            Duplicate plan <strong className="co-break-word">{name}</strong>?
          </StackItem>
          <FormGroupWithHelpText
            fieldId="name"
            helperText={t('Kubernetes name of the new migration Plan resource')}
            label={t('New migration plan name')}
          >
            <TextInput
              id="name"
              onChange={(_, value) => {
                setNewName(value);
              }}
              spellCheck="false"
              value={newName}
            />
          </FormGroupWithHelpText>
          <StackItem>
            All needed Mappings and Hooks will be duplicated and attached to the new Plan.
          </StackItem>
          <StackItem>
            Storage map: <strong className="co-break-word">{storageMap?.metadata?.name}</strong>
          </StackItem>
          <StackItem>
            Network map: <strong className="co-break-word">{networkMap?.metadata?.name}</strong>
          </StackItem>
        </Stack>
      </ForkliftTrans>
    </ModalForm>
  );
};

export default DuplicateModal;
