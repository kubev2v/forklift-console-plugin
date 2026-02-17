export type LightspeedAttachment = {
  attachmentType: 'Events' | 'Log' | 'YAML' | 'YAMLFiltered' | 'YAMLUpload';
  isEditable?: boolean;
  kind: string;
  name: string;
  namespace: string;
  originalValue?: string;
  ownerName?: string;
  value: string;
};

export type OpenLightspeedOptions = {
  autoSubmit?: boolean;
};

export type OpenLightspeedFn = (
  prompt?: string,
  attachments?: LightspeedAttachment[],
  options?: OpenLightspeedOptions,
) => void;

export type UseLightspeedResult = {
  isAvailable: boolean;
  isLoading: boolean;
  openLightspeed: OpenLightspeedFn;
};

export type OLSReducerExtension = {
  properties: {
    scope: string;
  };
  type: 'console.redux-reducer';
};
