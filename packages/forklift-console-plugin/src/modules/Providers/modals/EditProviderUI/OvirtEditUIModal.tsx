import React from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { validateOvirtUILink } from '../../utils';
import { EditModal } from '../EditModal';

import { patchProviderUI } from './utils/patchProviderUI';
import { EditProviderUIModalProps } from './EditProviderUIModal';

export const OvirtEditUIModal: React.FC<EditProviderUIModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  const ModalBody = (
    <ForkliftTrans>
      <p>Link for the Red Hat Virtualization Manager (RHVM) landing page.</p>
      <br />
      <p>Use this link to access the RHVM user interface for RHV VMs management.</p>
      <br />
      <p>
        The format of the provided link for the Red Hat Virtualization Manager (RHVM) landing page
        should include a scheme, a domain name, path, and optionally a port. Usually the path will
        end with /ovirt-engine, for example:{' '}
        <strong>https://rhv-host-example.com/ovirt-engine</strong>.
      </p>
      <br />
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
        'Link for the Red Hat Virtualization Manager (RHVM) landing page. For example, https://rhv-host-example.com/ovirt-engine.',
      )}
      onConfirmHook={patchProviderUI}
      validationHook={validateOvirtUILink}
    />
  );
};
