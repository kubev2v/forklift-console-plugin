import type { HookSource } from 'src/plans/create/steps/migration-hooks/constants';

export type HookEditFormValues = {
  aapExistingTokenSecretName?: string;
  aapJobTemplateId?: number;
  aapTimeout?: number;
  aapToken?: string;
  aapUrl?: string;
  hookSource: HookSource;
  image: string;
  playbook: string;
  serviceAccount: string;
};

export enum HookField {
  AapExistingTokenSecretName = 'aapExistingTokenSecretName',
  AapJobTemplateId = 'aapJobTemplateId',
  AapTimeout = 'aapTimeout',
  AapToken = 'aapToken',
  AapUrl = 'aapUrl',
  HookSource = 'hookSource',
  Image = 'image',
  Playbook = 'playbook',
  ServiceAccount = 'serviceAccount',
}
