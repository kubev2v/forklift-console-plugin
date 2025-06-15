import { getInventoryApiUrl } from 'src/modules/Providers/utils/helpers/getApiUrl';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

export const uploadVddkTarball = async (file: File): Promise<unknown> => {
  const formData = new FormData();
  formData.append('file', file, file.name); // Let browser set the correct file name & type

  const response = await consoleFetch(getInventoryApiUrl('vddk/build-image'), {
    body: formData,
    headers: {
      Authorization: `Bearer sha256~MKuktTdOFEa0zVRN5wkDNUt0pAa1JW8XjzudMBCe8KM`,
      'Content-Type': 'multipart/form-data',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errText}`);
  }

  return response.json();
};
