import { type FC, type FormEvent, useReducer } from 'react';
import { Base64 } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { SelectableCard } from 'src/modules/Providers/utils/components/Gallery/SelectableCard';
import { SelectableGallery } from 'src/modules/Providers/utils/components/Gallery/SelectableGallery';
import { validateK8sName, type ValidationMsg } from 'src/modules/Providers/utils/validators/common';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  ProjectNameSelect,
  useProjectNameSelectOptions,
} from '@components/common/ProjectNameSelect';
import type { IoK8sApiCoreV1Secret, ProviderType, V1beta1Provider } from '@kubev2v/types';
import {
  Flex,
  FlexItem,
  Form,
  HelperText,
  HelperTextItem,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';

import { EditProvider } from './EditProvider';
import { EditProviderSectionHeading } from './EditProviderSectionHeading';
import { providerCardItems } from './providerCardItems';

export type ProvidersCreateFormProps = {
  newProvider: V1beta1Provider;
  newSecret: IoK8sApiCoreV1Secret;
  onNewProviderChange: (provider: V1beta1Provider) => void;
  onNewSecretChange: (secret: IoK8sApiCoreV1Secret) => void;
  providerNames?: string[];
  projectName?: string;
  onProjectNameChange?: (value: string) => void;
};

const ProvidersCreateForm: FC<ProvidersCreateFormProps> = ({
  newProvider,
  newSecret,
  onNewProviderChange,
  onNewSecretChange,
  onProjectNameChange,
  projectName,
  providerNames = [],
}) => {
  const { t } = useForkliftTranslation();
  const [projectNameOptions] = useProjectNameSelectOptions(projectName);

  const initialState = {
    validation: {
      name: { msg: 'Unique Kubernetes resource name identifier.', type: 'default' },
    },
  };

  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET_VALIDATION':
        return { ...state, validation: action.payload };
      default:
        return state;
    }
  }, initialState);

  const handleNameChange = (name: string) => {
    const trimmedValue = name.trim();
    let validation: ValidationMsg;

    if (trimmedValue === '') {
      validation = { msg: 'Required, unique Kubernetes resource name identifier.', type: 'error' };
    } else if (providerNames.includes(trimmedValue))
      validation = {
        msg: `A provider named ${trimmedValue} already exists in the system`,
        type: 'error',
      };
    else if (!validateK8sName(trimmedValue)) {
      validation = { msg: 'Invalid kubernetes resource name', type: 'error' };
    } else {
      validation = { msg: 'Unique Kubernetes resource name identifier.', type: 'success' };
    }

    dispatch({
      payload: { name: validation },
      type: 'SET_VALIDATION',
    });

    onNewProviderChange({
      ...newProvider,
      metadata: { ...newProvider?.metadata, name: trimmedValue },
    });
  };

  const handleTypeChange = (type: ProviderType) => {
    // default auth type for openstack (if not defined)
    if (type === 'openstack' && !newSecret?.data?.authType) {
      onNewSecretChange({
        ...newSecret,
        data: { ...newSecret.data, authType: Base64.encode('applicationcredential') },
      });
    }

    onNewProviderChange({ ...newProvider, spec: { ...newProvider?.spec, type } });
  };

  const onChange: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    handleNameChange(value);
  };

  return (
    <ModalHOC>
      <div className="forklift-create-provider-edit-section">
        <EditProviderSectionHeading text={t('Provider details')} />

        <Form isWidthLimited className="forklift-section-secret-edit">
          <ProjectNameSelect
            value={projectName}
            options={projectNameOptions}
            onSelect={onProjectNameChange}
            popoverHelpContent={
              <ForkliftTrans>The project that your provider will be created in.</ForkliftTrans>
            }
          />

          <FormGroupWithHelpText label={t('Provider type')} isRequired fieldId="type">
            {newProvider?.spec?.type ? (
              <Flex>
                <FlexItem className="forklift--create-provider-edit-card-selected">
                  <SelectableCard
                    title={providerCardItems[newProvider?.spec?.type]?.title}
                    titleLogo={providerCardItems[newProvider?.spec?.type]?.logo}
                    onChange={() => {
                      handleTypeChange(null);
                    }}
                    isSelected
                    isCompact
                    content={
                      <Tooltip
                        content={
                          <div>{t('Click to select a different provider from the list.')}</div>
                        }
                      >
                        <HelperText>
                          <HelperTextItem variant="indeterminate">
                            {t('Click to unselect.')}
                          </HelperTextItem>
                        </HelperText>
                      </Tooltip>
                    }
                  />
                </FlexItem>
              </Flex>
            ) : (
              <SelectableGallery
                selectedID={newProvider?.spec?.type}
                items={providerCardItems}
                onChange={handleTypeChange}
              />
            )}
          </FormGroupWithHelpText>
        </Form>

        {newProvider?.spec?.type && (
          <Form isWidthLimited className="forklift-create-provider-edit-section">
            <FormGroupWithHelpText
              label={t('Provider resource name')}
              isRequired
              fieldId="k8sName"
              helperText={state.validation.name.msg}
              helperTextInvalid={state.validation.name.msg}
              validated={state.validation.name.type}
            >
              <TextInput
                spellCheck="false"
                isRequired
                type="text"
                id="k8sName"
                name="name"
                value={newProvider.metadata.name} // Use the appropriate prop value here
                validated={state.validation.name.type}
                onChange={(e, value) => {
                  onChange(value, e);
                }} // Call the custom handler method
              />
            </FormGroupWithHelpText>
          </Form>
        )}
      </div>

      <div className="forklift-create-provider-edit-section">
        <EditProvider
          newProvider={newProvider}
          newSecret={newSecret}
          onNewProviderChange={onNewProviderChange}
          onNewSecretChange={onNewSecretChange}
        />
      </div>
    </ModalHOC>
  );
};

export default ProvidersCreateForm;
