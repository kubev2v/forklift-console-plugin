import type { HookSource } from 'src/plans/create/steps/migration-hooks/constants';

export type HookEditFormValues = {
  aapJobTemplateId?: number;
  hookSource: HookSource;
  image: string;
  playbook: string;
  serviceAccount: string;
};

export enum HookField {
  AapJobTemplateId = 'aapJobTemplateId',
  HookSource = 'hookSource',
  Image = 'image',
  Playbook = 'playbook',
  ServiceAccount = 'serviceAccount',
}
