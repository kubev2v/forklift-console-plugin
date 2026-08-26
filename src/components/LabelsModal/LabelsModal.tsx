import {
  type ChangeEvent,
  type DetailedHTMLProps,
  type HTMLAttributes,
  type ReactNode,
  useState,
} from 'react';
import TagsInput from 'react-tagsinput';

import ModalForm from '@components/ModalForm/ModalForm';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { LABELS_MODAL_DESCRIPTION } from './utils/constants';
import { isLabelValid } from './utils/isLabelValid';
import { labelsArrayToObject } from './utils/labelsArrayToObject';
import { labelsToArray } from './utils/labelsToArray';
import { renderTag } from './utils/renderTag';

import './LabelsModal.scss';

// console is declaring a new html element for some reason, we have to copy it for css reasons.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Console tags-input custom element requires JSX namespace augmentation
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- ambient IntrinsicElements augmentation requires interface
    interface IntrinsicElements {
      'tags-input': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export type LabelsModalProps = {
  description?: ReactNode;
  initialLabels?: Record<string, string>;
  onConfirm: (labels: Record<string, string | null>) => Promise<K8sResourceCommon>;
  title?: string;
};

const LabelsModal: OverlayComponent<LabelsModalProps> = ({
  closeOverlay,
  description,
  initialLabels,
  onConfirm,
  title,
}) => {
  const { t } = useForkliftTranslation();
  const [inputValue, setInputValue] = useState('');
  const [isInputValid, setIsInputValid] = useState(true);
  const [labels, setLabels] = useState<string[]>(
    labelsToArray(isEmpty(initialLabels) ? {} : initialLabels),
  );

  // Keys that add tags: Enter
  const addKeys = [13];
  // Backspace deletes tags, but not if there is text being edited in the input field
  const removeKeys = inputValue.length ? [] : [8];

  const onInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;

    if (value === '') {
      setInputValue(value);
      setIsInputValid(true);
      return;
    }
    setInputValue(value);
    setIsInputValid(isLabelValid(value));
  };

  const inputProps = {
    autoFocus: true,
    className: 'input'.concat(isInputValid ? '' : ' invalid-tag'),
    onChange: onInputChange,
    placeholder: isEmpty(labels) ? 'key=value' : '',
    spellCheck: 'false',
    value: inputValue,
  };

  const handleLabelsChange = (newLabels: string[], changed: string[]): void => {
    const { 0: newLabel } = changed;

    if (!isLabelValid(newLabel)) {
      setIsInputValid(false);
      return;
    }

    // duplicate labels
    if (newLabels.filter((label) => label === newLabel).length > 1) {
      setIsInputValid(false);
      return;
    }

    // if key exists, overwrite value
    if (newLabels.filter((label) => label.split('=')[0] === newLabel.split('=')[0]).length > 1) {
      const filteredLabels = newLabels.filter(
        (label) => label.split('=')[0] !== newLabel.split('=')[0],
      );
      setLabels([...filteredLabels, newLabel]);
      setInputValue('');
      return;
    }

    setLabels(newLabels);
    setInputValue('');
  };

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={async () => onConfirm(labelsArrayToObject(labels))}
      testId="labels-modal"
      title={title ?? t('Edit labels')}
    >
      <Stack hasGutter>
        <StackItem>{description ?? LABELS_MODAL_DESCRIPTION}</StackItem>
        <StackItem>
          <div className="forklift-labels-modal-body">
            <tags-input>
              <TagsInput
                addKeys={addKeys}
                addOnBlur
                className="tags"
                inputProps={inputProps}
                onChange={handleLabelsChange}
                removeKeys={removeKeys}
                renderTag={renderTag}
                value={labels}
              />
            </tags-input>
          </div>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default LabelsModal;
