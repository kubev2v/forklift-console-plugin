import type { HookSource } from 'src/plans/create/steps/migration-hooks/constants';

export type HookEditFormValues = {
  aapJobTemplateId?: number;
  aapJobTemplateName?: string;
  hookSource: HookSource;
  image: string;
  playbook: string;
  serviceAccount: string;
};

export enum HookField {
  AapJobTemplateId = 'aapJobTemplateId',
  AapJobTemplateName = 'aapJobTemplateName',
  HookSource = 'hookSource',
  Image = 'image',
  Playbook = 'playbook',
  ServiceAccount = 'serviceAccount',
}
