import React from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { patchProviderUI } from './utils/patchProviderUI';
import { validateOpenshiftUILink } from '../../utils/validators/provider/openshift/validateOpenshiftUILink';
import { EditModal } from '../EditModal/EditModal';
import { EditProviderUIModalProps } from './EditProviderUIModal';

export const OpenshiftEditUIModal: React.FC<EditProviderUIModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  const ModalBody = (
    <ForkliftTrans>
      <p>Link for the OpenShift Virtualization web console UI.</p>
      <p>
        Use this link to access the user interface for the provider&apos;s virtualization
        management.
      </p>
      <p>If no link value is specify then a default auto calculated or an empty value is set.</p>
    </ForkliftTrans>
  );

  return (
    <EditModal
      {...props}
      jsonPath={['metadata', 'annotations', 'forklift.konveyor.io/providerUI']}
      title={props?.title || t('Edit provider web UI link')}
      label={props?.label || t('Provider web UI link')}
      model={ProviderModel}
      variant={ModalVariant.large}
      body={ModalBody}
      helperText={t(
        'Link for OpenShift Virtualization web console UI. For example, https://console-openshift-console.apps.openshift-domain.com.',
      )}
      onConfirmHook={patchProviderUI}
      validationHook={validateOpenshiftUILink}
    />
  );
};
