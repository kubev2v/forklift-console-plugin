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
  TextInput,
  Checkbox,
} from '@patternfly/react-core';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  ValidatedTextInput,
  ValidatedPasswordInput,
} from '@migtools/lib-ui';

import { SimpleSelect, OptionWithValue } from 'legacy/src/common/components/SimpleSelect';
import {
  ENV,
  fingerprintSchema,
  hostnameSchema,
  ProviderType,
  PROVIDER_TYPES,
  PROVIDER_TYPE_NAMES,
  urlSchema,
  usernameSchema,
} from 'legacy/src/common/constants';
import { usePausedPollingEffect } from 'legacy/src/common/context';
import {
  getProviderNameSchema,
  useCreateProviderMutation,
  usePatchProviderMutation,
  useClusterProvidersQuery,
} from 'legacy/src/queries';

import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { IProviderObject } from 'legacy/src/queries/types';
import { QuerySpinnerMode, ResolvedQuery } from 'legacy/src/common/components/ResolvedQuery';
import { useAddEditProviderPrefillEffect } from './helpers';
import { LoadingEmptyState } from 'legacy/src/common/components/LoadingEmptyState';

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
const openStackLabelPrefix = 'OpenStack Identity (Keystone)';
const getLabelName = (type: 'hostname' | 'URL' | 'username' | 'pwd', prefix?: string) => {
  let label = '';
  switch (type) {
    case 'hostname': {
      label = prefix ? `${prefix} host name or IP address` : 'Host name or IP address';
      break;
    }
    case 'URL': {
      label = prefix ? `${prefix} URL` : 'URL';
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
const isOpenStack = (providerType: ProviderType | null) => providerType === 'openstack';
const brandPrefix = (providerType: ProviderType | null) =>
  isOvirt(providerType) ? oVirtLabelPrefix :
  isVmWare(providerType) ? vmwareLabelPrefix :
  isOpenStack(providerType) ? openStackLabelPrefix: undefined;

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

  const insecureSkipVerify = useFormField(false, yup.boolean().label('skip server SSL certificate verification'));
  const caCertFildSchema = yup.string().label('CA certificate');

  return {
    vsphere: useFormState({
      ...sourceProviderFields,
      insecureSkipVerify,
      fingerprint: useFormField('', fingerprintSchema.required()),
      vddkInitImage: useFormField('', yup.string().label('VDDK init image').required()),
    }),
    ovirt: useFormState({
      ...sourceProviderFields,
      insecureSkipVerify,
      caCert: useFormField('', insecureSkipVerify.value ? caCertFildSchema : caCertFildSchema.required()),
      caCertFilename: useFormField('', yup.string()),
    }),
    openstack: useFormState({
      ...commonProviderFields,
      openstackUrl: useFormField('', urlSchema.required().label(getLabelName('URL', brandPrefix(providerTypeField.value)))),
      username: useFormField('', usernameSchema.required().label(getLabelName('username', brandPrefix(providerTypeField.value)))),
      password: useFormField('', yup.string().max(256).label(getLabelName('pwd', brandPrefix(providerTypeField.value))).required()),
      domainName: useFormField('', yup.string().label('Domain').required()),
      projectName: useFormField('', yup.string().label('Project').required()),
      region: useFormField('', yup.string().label('Region').required()),
      insecureSkipVerify,
      caCertIfSecure: useFormField('', caCertFildSchema),
      caCertFilenameIfSecure: useFormField('', yup.string()),
    }),
    openshift: useFormState({
      ...commonProviderFields,
      openshiftUrl: useFormField('', urlSchema.label('URL').required()),
      saToken: useFormField('', yup.string().label('Service account token').required()),
    }),
  };
};

export type AddProviderFormState = ReturnType<typeof useAddProviderFormState>; // ✨ Magic
export type VMwareProviderFormValues = AddProviderFormState['vsphere']['values'];
export type RHVProviderFormValues = AddProviderFormState['ovirt']['values'];
export type OpenStackProviderFormValues = AddProviderFormState['openstack']['values'];
export type OpenshiftProviderFormValues = AddProviderFormState['openshift']['values'];
export type AddProviderFormValues =
  | VMwareProviderFormValues
  | RHVProviderFormValues
  | OpenStackProviderFormValues
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
  const isOpenStackButtonEnabled = forms.openstack.fields.insecureSkipVerify.value || forms.openstack.fields.caCertIfSecure.value;

  // Combines fields of all 3 forms into one type with all properties as optional.
  // This way, we can conditionally show fields based on whether they are defined in form state
  // instead of duplicating the logic of which providers have which fields.
  const fields = providerType
    ? (forms[providerType].fields as Partial<
        typeof forms.vsphere.fields & typeof forms.ovirt.fields & typeof forms.openstack.fields & typeof forms.openshift.fields
      >)
    : null;

  const usernamePlaceholder = {
    vsphere: 'Example, administrator@vsphere.local',
    ovirt: 'Examples, admin@internal, admin@ovirt@internalsso',
    openstack: 'Example, admin',
    openshift: undefined,
  }[providerType || ''];

  const urlPlaceholder = {
    vsphere: undefined,
    ovirt: undefined,
    openstack: 'Example, http://controller:5000/v3',
    openshift: 'Example, https://api.clusterName.domain:6443',
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

  return (
    <Modal
      className="AddEditProviderModal"
      variant="small"
      position="top"
      title={`${!providerBeingEdited ? 'Create' : 'Edit'} provider`}
      isOpen
      onClose={() => onClose()}
      footer={
        <Stack hasGutter>
          <ResolvedQuery
            result={mutateProviderResult}
            errorTitle={`Cannot ${!providerBeingEdited ? 'create' : 'edit'} provider`}
            spinnerMode={QuerySpinnerMode.Inline}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              isDisabled={providerType === 'openstack' ?
                !isFormDirty || !isFormValid || mutateProviderResult.isLoading || !isOpenStackButtonEnabled:
                !isFormDirty || !isFormValid || mutateProviderResult.isLoading}
              onClick={() => {
                if (formValues) {
                  mutateProvider(formValues);
                }
              }}
            >
              {!providerBeingEdited ? 'Create' : 'Save'}
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
              label="Provider resource namespace (default to migration operator namespace)"
              fieldId="plan-namespace"
            >
              <TextInput
                id="plan-namespace"
                aria-label="Plan Namespace"
                value={prefillNamespace}
                isDisabled={true}
              />
            </FormGroup>

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

                {fields?.openstackUrl ? (
                  <ValidatedTextInput
                    field={fields.openstackUrl}
                    isRequired
                    fieldId="openstack-url"
                    inputProps={{
                      placeholder: urlPlaceholder,
                    }}
                    formGroupProps={{
                      labelIcon: (
                        <Popover
                          bodyContent={
                            <>
                              OpenStack Identity (Keystone) endpoint.
                              <br />
                              For example: <i>http://controller:5000/v3</i>
                            </>
                          }
                        >
                          <Button
                            variant="plain"
                            aria-label="More info for URL field"
                            onClick={(e) => e.preventDefault()}
                            aria-describedby="openstack-url-info"
                            className="pf-c-form__group-label-help"
                          >
                            <HelpIcon noVerticalAlign />
                          </Button>
                        </Popover>
                      ),
                    }}
                  />
                ) : null}

                {fields?.hostname ? (
                  <ValidatedTextInput
                    field={fields.hostname}
                    isRequired
                    fieldId="hostname"
                  />
                ) : null}

                {fields?.username ? (
                  <ValidatedTextInput
                    inputProps={{
                      placeholder: usernamePlaceholder,
                    }}
                    field={fields.username}
                    isRequired
                    fieldId="username"
                  />
                ) : null}

                {fields?.password ? (
                  <ValidatedPasswordInput
                    field={fields.password}
                    isRequired
                    fieldId="password"
                  />
                ) : null}

                {fields?.domainName ? (
                  <ValidatedTextInput
                    field={fields.domainName}
                    isRequired
                    fieldId="domain-name"
                  />
                ) : null}

                {fields?.projectName ? (
                  <ValidatedTextInput
                    field={fields.projectName}
                    isRequired
                    fieldId="project-name"
                  />
                ) : null}

                {fields?.region? (
                  <ValidatedTextInput
                    field={fields.region}
                    isRequired
                    fieldId="region"
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

                {fields?.insecureSkipVerify? (
                  <Checkbox
                    label="Skip certificate validation (if checked, the provider's certificate won't be validated)"
                    aria-label="Insecure connection checkbox"
                    id="insecure-check"
                    isChecked={fields.insecureSkipVerify.value}
                    onChange={(checked) => fields.insecureSkipVerify.setValue(checked)}
                  />
                ) : null}

                {fields?.fingerprint ? (
                  <ValidatedTextInput
                    field={fields.fingerprint}
                    isRequired
                    fieldId="fingerprint"
                    formGroupProps={{
                      labelIcon: (
                        <Popover
                          bodyContent={
                            <div>
                              The provider currently requires the SHA-1 fingerprint of the vCenter Server's
                              TLS certificate in all circumstances. vSphere calls this the server's <code>thumbprint</code>.
                            </div>
                          }
                        >
                        <Button
                          variant="plain"
                          aria-label="More info for vsphere fingerprint field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="fingerprint-info"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </Button>
                      </Popover>
                      ),
                    }}
                  />
                ) : null }

                {fields?.insecureSkipVerify && !fields?.insecureSkipVerify?.value && fields?.caCert && fields?.caCertFilename ? (
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

                {fields?.insecureSkipVerify && !fields?.insecureSkipVerify?.value && fields?.caCertIfSecure && fields?.caCertFilenameIfSecure ? (
                  <FormGroup
                    label="CA certificate"
                    labelIcon={
                      <Popover
                        bodyContent={
                          <div>
                            The CA certificate file to validate before connecting to the OpenStack Identity server.
                          </div>
                        }
                      >
                        <Button
                          variant="plain"
                          aria-label="More info for CA certificate field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="caCertIfSecure"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </Button>
                      </Popover>
                    }
                    fieldId="caCertIfSecure"
                    {...getFormGroupProps(fields.caCertIfSecure)}
                  >
                    <FileUpload
                      id="caCertIfSecure"
                      type="text"
                      value={fields.caCertIfSecure.value}
                      filename={fields.caCertFilenameIfSecure.value}
                      onChange={(value, filename) => {
                        fields.caCertIfSecure?.setValue(value as string);
                        fields.caCertIfSecure?.setIsTouched(true);
                        fields.caCertFilenameIfSecure?.setValue(filename);
                      }}
                      onBlur={() => fields.caCertIfSecure?.setIsTouched(true)}
                      validated={fields.caCertIfSecure?.shouldShowError ? 'error' : 'default'}
                    />
                  </FormGroup>
                ) : null}

                {fields?.openshiftUrl ? (
                  <ValidatedTextInput
                    field={fields.openshiftUrl}
                    isRequired
                    fieldId="openshift-url"
                    inputProps={{
                      placeholder: urlPlaceholder,
                    }}
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
