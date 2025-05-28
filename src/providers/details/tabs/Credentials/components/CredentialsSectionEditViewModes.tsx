import { type FC, useState } from 'react';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import CredentialsSectionEditMode from './CredentialsSectionEditMode';
import CredentialsSectionViewMode from './CredentialsSectionViewMode';

import './CredentialsSectionEditViewModes.style.scss';

type CredentialsSectionEditViewModesProps = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

const CredentialsSectionEditViewModes: FC<CredentialsSectionEditViewModesProps> = ({
  provider,
  secret,
}) => {
  const [editMode, setEditMode] = useState(false);

  const toggleEdit = () => {
    setEditMode((isEdit) => !isEdit);
  };

  return editMode ? (
    <CredentialsSectionEditMode provider={provider} secret={secret} toggleEdit={toggleEdit} />
  ) : (
    <CredentialsSectionViewMode provider={provider} secret={secret} toggleEdit={toggleEdit} />
  );
};

export default CredentialsSectionEditViewModes;
