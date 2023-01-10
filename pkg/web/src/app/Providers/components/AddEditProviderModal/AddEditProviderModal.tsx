import * as React from 'react';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  Flex,
  Stack,
  Popover,
  FileUpload,
  Spinner,
  Text,
  Checkbox,
  DescriptionList,
  DescriptionListTerm,
  DescriptionListDescription,
  DescriptionListGroup,
  Title,
  Panel,
  PanelMain,
  PanelMainBody,
  Alert,
} from '@patternfly/react-core';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  ValidatedTextInput,
  ValidatedPasswordInput,
} from '@migtools/lib-ui';

import { SimpleSelect, OptionWithValue } from '@app/common/components/SimpleSelect';
import {
  ENV,
  fingerprintSchema,
  hostnameSchema,
  ProviderType,
  PROVIDER_TYPES,
  PROVIDER_TYPE_NAMES,
  urlSchema,
  usernameSchema,
} from '@app/common/constants';
import { usePausedPollingEffect } from '@app/common/context';
import {
  getProviderNameSchema,
  useCreateProviderMutation,
  usePatchProviderMutation,
  useClusterProvidersQuery,
  useCertificateQuery,
} from '@app/queries';

import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { IProviderObject } from '@app/queries/types';
import { QuerySpinnerMode, ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { useAddEditProviderPrefillEffect } from './helpers';
import { LoadingEmptyState } from '@app/common/components/LoadingEmptyState';

interface IAddEditProviderModalProps {
  onClose: (navToProviderType?: ProviderType | null) => void;
  providerBeingEdited: IProviderObject | null;
  namespace: string;
}

const PROVIDER_TYPE_OPTIONS = PROVIDER_TYPES.map((type) => ({
  toString: () => PROVIDER_TYPE_NAMES[type],
  value: type,
})) as OptionWithValue<ProviderType>[];

const oVirtLabelPrefix = process.env.BRAND_TYPE === 'RedHat' ? 'RHV Manager' : 'oVirt Engine';
const vmwareLabelPrefix = 'vCenter';
const getLabelName = (type: 'hostname' | 'username' | 'pwd', prefix?: string) => {
  let label = '';
  switch (type) {
    case 'hostname': {
      label = prefix ? `${prefix} host name or IP address` : 'Host name or IP address';
      break;
    }
    case 'username': {
      label = prefix ? `${prefix} user name` : 'User name';
      break;
    }
    case 'pwd': {
      label = prefix ? `${prefix} password` : 'Password';
      break;
    }
    default: {
      label = 'Unknown label';
    }
  }
  return label;
};

const isVmWare = (providerType: ProviderType | null) => providerType === 'vsphere';
const isOvirt = (providerType: ProviderType | null) => providerType === 'ovirt';
const brandPrefix = (providerType: ProviderType | null) =>
  isOvirt(providerType) ? oVirtLabelPrefix : isVmWare(providerType) ? vmwareLabelPrefix : undefined;

const useAddProviderFormState = (
  clusterProvidersQuery: ReturnType<typeof useClusterProvidersQuery>,
  providerBeingEdited: IProviderObject | null
) => {
  const providerTypeField = useFormField<ProviderType | null>(
    null,
    yup
      .mixed()
      .label('Provider type')
      .oneOf([...PROVIDER_TYPES]) // Spread necessary because readonly array isn't assignable to mutable any[]
      .required()
  );

  const commonProviderFields = {
    providerType: providerTypeField,
    name: useFormField(
      '',
      getProviderNameSchema(clusterProvidersQuery, providerBeingEdited).label('Name').required()
    ),
  };

  const sourceProviderFields = {
    ...commonProviderFields,
    hostname: useFormField(
      '',
      hostnameSchema.label(getLabelName('hostname', brandPrefix(providerTypeField.value)))
    ),
    username: useFormField(
      '',
      usernameSchema
        .required()
        .label(getLabelName('username', brandPrefix(providerTypeField.value)))
    ),
    password: useFormField(
      '',
      yup
        .string()
        .max(256)
        .label(getLabelName('pwd', brandPrefix(providerTypeField.value)))
        .required()
    ),
  };

  return {
    vsphere: useFormState({
      ...sourceProviderFields,
      fingerprint: useFormField('', fingerprintSchema.required()),
      isCertificateValid: useFormField(false, yup.boolean()),
      vddkInitImage: useFormField('', yup.string().label('VDDK init image').required()),
    }),
    ovirt: useFormState({
      ...sourceProviderFields,
      caCert: useFormField('', yup.string().label('CA certificate').required()),
      caCertFilename: useFormField('', yup.string()),
    }),
    openshift: useFormState({
      ...commonProviderFields,
      url: useFormField('', urlSchema.label('URL').required()),
      saToken: useFormField('', yup.string().label('Service account token').required()),
    }),
  };
};

export type AddProviderFormState = ReturnType<typeof useAddProviderFormState>; // ✨ Magic
export type VMwareProviderFormValues = AddProviderFormState['vsphere']['values'];
export type RHVProviderFormValues = AddProviderFormState['ovirt']['values'];
export type OpenshiftProviderFormValues = AddProviderFormState['openshift']['values'];
export type AddProviderFormValues =
  | VMwareProviderFormValues
  | RHVProviderFormValues
  | OpenshiftProviderFormValues;

export const AddEditProviderModal: React.FunctionComponent<IAddEditProviderModalProps> = ({
  onClose,
  providerBeingEdited,
  namespace,
}: IAddEditProviderModalProps) => {
  usePausedPollingEffect();
  const prefillNamespace =
    providerBeingEdited?.metadata?.namespace || namespace || ENV.DEFAULT_NAMESPACE;

  const clusterProvidersQuery = useClusterProvidersQuery(prefillNamespace);

  const forms = useAddProviderFormState(clusterProvidersQuery, providerBeingEdited);

  const { isDonePrefilling } = useAddEditProviderPrefillEffect(
    forms,
    providerBeingEdited,
    prefillNamespace
  );

  const providerTypeField = forms.vsphere.fields.providerType;
  const providerType = providerTypeField.value;
  const formValues = providerType ? forms[providerType].values : null;
  const isFormValid = providerType ? forms[providerType].isValid : false;
  const isFormDirty = providerType ? forms[providerType].isDirty : false;

  // Combines fields of all 3 forms into one type with all properties as optional.
  // This way, we can conditionally show fields based on whether they are defined in form state
  // instead of duplicating the logic of which providers have which fields.
  const fields = providerType
    ? (forms[providerType].fields as Partial<
        typeof forms.vsphere.fields & typeof forms.ovirt.fields & typeof forms.openshift.fields
      >)
    : null;

  const usernamePlaceholder = {
    vsphere: 'Example, administrator@vsphere.local',
    ovirt: 'Example, admin@internal',
    openshift: undefined,
  }[providerType || ''];

  const createProviderMutation = useCreateProviderMutation(prefillNamespace, providerType, onClose);

  const patchProviderMutation = usePatchProviderMutation(
    prefillNamespace,
    providerType,
    providerBeingEdited,
    onClose
  );

  const mutateProvider = !providerBeingEdited
    ? createProviderMutation.mutate
    : patchProviderMutation.mutate;
  const mutateProviderResult = !providerBeingEdited
    ? createProviderMutation
    : patchProviderMutation;

  const [isCertificateQueryEnabled, setCertificateQueryEnabled] = React.useState(false);
  const certificateQuery = useCertificateQuery(
    fields?.hostname?.value || '',
    isCertificateQueryEnabled
  );

  const certificateConfirmButtonRef = React.useRef<HTMLElement>(null);

  const scrollVerifyButtonIntoView = () =>
    certificateConfirmButtonRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <Modal
      className="AddEditProviderModal"
      variant="small"
      position="top"
      title={`${!providerBeingEdited ? 'Add' : 'Edit'} provider`}
      isOpen
      onClose={() => onClose()}
      footer={
        <Stack hasGutter>
          <ResolvedQuery
            result={mutateProviderResult}
            errorTitle={`Cannot ${!providerBeingEdited ? 'add' : 'edit'} provider`}
            spinnerMode={QuerySpinnerMode.Inline}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              isDisabled={!isFormDirty || !isFormValid || mutateProviderResult.isLoading}
              onClick={() => {
                if (formValues) {
                  mutateProvider(formValues);
                }
              }}
            >
              {!providerBeingEdited ? 'Add' : 'Save'}
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={() => onClose()}
              isDisabled={mutateProviderResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <ResolvedQuery result={clusterProvidersQuery} errorTitle="Cannot load providers">
        {(providerBeingEdited && !isDonePrefilling) || clusterProvidersQuery.isLoading ? (
          <LoadingEmptyState />
        ) : (
          <Form>
            <FormGroup
              label="Type"
              isRequired
              fieldId="provider-type"
              {...getFormGroupProps(providerTypeField)}
            >
              <SimpleSelect
                id="provider-type"
                aria-label="Provider type"
                options={PROVIDER_TYPE_OPTIONS}
                value={[PROVIDER_TYPE_OPTIONS.find((option) => option.value === providerType)]}
                onChange={(selection) => {
                  providerTypeField.setValue((selection as OptionWithValue<ProviderType>).value);
                  providerTypeField.setIsTouched(true);
                }}
                placeholderText="Select a provider type..."
                isDisabled={!!providerBeingEdited}
                menuAppendTo="parent"
                maxHeight="40vh"
              />
            </FormGroup>
            {providerType ? (
              <>
                {fields?.name ? (
                  <ValidatedTextInput
                    field={forms[providerType].fields.name}
                    isRequired
                    fieldId="name"
                    inputProps={{
                      isDisabled: !!providerBeingEdited,
                    }}
                    formGroupProps={{
                      helperText: 'User specified name to display in the list of providers',
                    }}
                  />
                ) : null}
                {fields?.hostname ? (
                  <ValidatedTextInput
                    field={fields.hostname}
                    isRequired
                    fieldId="hostname"
                    inputProps={{
                      onChange: (field: string) => {
                        setCertificateQueryEnabled(false);
                        fields.isCertificateValid?.setValue(false);
                        fields.hostname?.setValue(field);
                      },
                    }}
                  />
                ) : null}
                {fields?.username ? (
                  <ValidatedTextInput
                    inputProps={{
                      placeholder: usernamePlaceholder,
                      onFocus: scrollVerifyButtonIntoView,
                    }}
                    field={fields.username}
                    isRequired
                    fieldId="username"
                  />
                ) : null}
                {fields?.password ? (
                  <ValidatedPasswordInput
                    inputProps={{ onFocus: scrollVerifyButtonIntoView }}
                    field={fields.password}
                    isRequired
                    fieldId="password"
                  />
                ) : null}
                {fields?.vddkInitImage ? (
                  <ValidatedTextInput
                    field={fields.vddkInitImage}
                    isRequired
                    fieldId="vddk-init-image"
                    formGroupProps={{
                      labelIcon: (
                        <Popover
                          bodyContent={
                            <>
                              Path of a VDDK image pushed to an image registry.
                              <br />
                              For example: <i>{'<registry_route_or_server_path>/vddk:<tag>'}</i>
                              <br />
                              See product documentation for more information.
                            </>
                          }
                          hasAutoWidth
                        >
                          <Button
                            variant="plain"
                            aria-label="More info for VDDK init image field"
                            onClick={(e) => e.preventDefault()}
                            aria-describedby="vddk-init-image-info"
                            className="pf-c-form__group-label-help"
                          >
                            <HelpIcon noVerticalAlign />
                          </Button>
                        </Popover>
                      ),
                    }}
                  />
                ) : null}
                {fields?.fingerprint ? (
                  <>
                    {!isCertificateQueryEnabled ? (
                      <Button
                        id="certificate-confirm-button"
                        key="confirm"
                        ref={certificateConfirmButtonRef}
                        aria-label="Verify Certificate"
                        variant="primary"
                        isDisabled={!fields.hostname?.isValid}
                        onClick={() => {
                          setCertificateQueryEnabled(true);
                        }}
                      >
                        Verify certificate
                      </Button>
                    ) : certificateQuery.status === 'loading' ? (
                      <div className="pf-c-empty-state__icon">
                        <Spinner aria-labelledby="loadingPrefLabel" size="sm" />
                        &nbsp;Retrieving SHA-1 certificate fingerprint
                      </div>
                    ) : certificateQuery.status === 'success' ? (
                      <>
                        <Panel variant="bordered">
                          <PanelMain>
                            <PanelMainBody>
                              <Title headingLevel="h4" size="md">
                                Certificate information
                              </Title>
                              <DescriptionList isCompact>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Issuer</DescriptionListTerm>
                                  <DescriptionListDescription id="issuer">
                                    {`${certificateQuery.data?.issuer.O} - ${certificateQuery.data?.issuer.OU}`}
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>
                                    vCenter SHA-1 fingerprint
                                  </DescriptionListTerm>
                                  <DescriptionListDescription id="fingerprint">
                                    {certificateQuery.data?.fingerprint}
                                    {providerBeingEdited &&
                                    fields.fingerprint?.cleanValue !==
                                      certificateQuery.data.fingerprint ? (
                                      <Alert
                                        variant="warning"
                                        isInline
                                        title="The authenticity of this host cannot be established"
                                      >
                                        This certificate&apos;s fingerprint does not match the
                                        previously known certificate. Manually validate the
                                        fingerprint before proceeding.
                                      </Alert>
                                    ) : null}
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Expiration date</DescriptionListTerm>
                                  <DescriptionListDescription id="expriry">
                                    {certificateQuery.data?.valid_to}
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                              </DescriptionList>
                            </PanelMainBody>
                          </PanelMain>
                        </Panel>
                        <Checkbox
                          label="I trust the authenticity of this certificate"
                          aria-label="Validate Certificate"
                          id="certificate-check"
                          name="certificateCheck"
                          isChecked={fields?.isCertificateValid?.value}
                          onChange={() => {
                            if (fields.isCertificateValid?.value !== true) {
                              if (
                                fields?.fingerprint &&
                                certificateQuery.data &&
                                certificateQuery.data.fingerprint !== ''
                              ) {
                                fields.fingerprint?.setValue(certificateQuery.data.fingerprint);
                              }
                            } else {
                              fields.fingerprint?.setValue('');
                            }
                            fields.isCertificateValid?.setValue(!fields.isCertificateValid.value);
                          }}
                        />
                      </>
                    ) : (
                      <Text>Error: Cannot retrieve certificate</Text>
                    )}
                  </>
                ) : null}
                {fields?.caCert && fields?.caCertFilename ? (
                  <FormGroup
                    label="CA certificate"
                    labelIcon={
                      <Popover
                        bodyContent={
                          <div>
                            The CA certificate is the{' '}
                            <code>/etc/pki/ovirt-engine/apache-ca.pem</code> file on the Manager
                            machine.
                          </div>
                        }
                      >
                        <Button
                          variant="plain"
                          aria-label="More info for CA certificate field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="caCert"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </Button>
                      </Popover>
                    }
                    fieldId="caCert"
                    {...getFormGroupProps(fields.caCert)}
                  >
                    <FileUpload
                      id="caCert"
                      type="text"
                      value={fields.caCert.value}
                      filename={fields.caCertFilename.value}
                      onChange={(value, filename) => {
                        fields.caCert?.setValue(value as string);
                        fields.caCert?.setIsTouched(true);
                        fields.caCertFilename?.setValue(filename);
                      }}
                      onBlur={() => fields.caCert?.setIsTouched(true)}
                      validated={fields.caCert?.shouldShowError ? 'error' : 'default'}
                    />
                  </FormGroup>
                ) : null}
                {fields?.url ? (
                  <ValidatedTextInput
                    field={fields.url}
                    isRequired
                    fieldId="openshift-url"
                    formGroupProps={{
                      labelIcon: (
                        <Popover
                          bodyContent={
                            <>
                              OpenShift cluster API endpoint.
                              <br />
                              For example: <i>https://api.clusterName.domain:6443</i>
                            </>
                          }
                        >
                          <Button
                            variant="plain"
                            aria-label="More info for URL field"
                            onClick={(e) => e.preventDefault()}
                            aria-describedby="openshift-cluster-url-info"
                            className="pf-c-form__group-label-help"
                          >
                            <HelpIcon noVerticalAlign />
                          </Button>
                        </Popover>
                      ),
                    }}
                  />
                ) : null}
                {fields?.saToken ? (
                  <ValidatedPasswordInput
                    field={fields.saToken}
                    isRequired
                    fieldId="openshift-sa-token"
                    formGroupProps={{
                      helperText: 'Input a service account token with cluster-admin privileges.',
                      labelIcon: (
                        <Popover
                          bodyContent={
                            <>
                              <div className="pf-u-mb-md">
                                To obtain SA token, run the following command:
                              </div>
                              <code>
                                $ oc serviceaccounts get-token serviceaccount_name -n namespace_name
                              </code>
                              <div className="pf-u-mt-md">
                                <b>** Be sure to use the namespace in which you created the SA.</b>
                              </div>
                            </>
                          }
                        >
                          <Button
                            variant="plain"
                            aria-label="More info for service account field"
                            onClick={(e) => e.preventDefault()}
                            aria-describedby="service-account-info"
                            className="pf-c-form__group-label-help"
                          >
                            <HelpIcon noVerticalAlign />
                          </Button>
                        </Popover>
                      ),
                    }}
                  />
                ) : null}
              </>
            ) : null}
          </Form>
        )}
      </ResolvedQuery>
    </Modal>
  );
};
