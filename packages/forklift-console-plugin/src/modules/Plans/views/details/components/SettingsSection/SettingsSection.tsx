import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { ProvidersPermissionStatus } from 'src/modules/Providers/utils';

import { V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';

import { TransferNetworkDetailsItem } from './components';

export const SettingsSection: React.FC<SettingsSectionProps> = (props) => (
  <ModalHOC>
    <SettingsSectionInternal {...props} />
  </ModalHOC>
);

export type SettingsSectionProps = {
  obj: V1beta1Plan;
  permissions: ProvidersPermissionStatus;
};

export const SettingsSectionInternal: React.FC<SettingsSectionProps> = ({ obj, permissions }) => {
  return (
    <>
      <DescriptionList
        className="forklift-page-section--details-status"
        columnModifier={{
          default: '1Col',
        }}
      >
        <TransferNetworkDetailsItem resource={obj} canPatch={permissions.canPatch} />
      </DescriptionList>
    </>
  );
};
