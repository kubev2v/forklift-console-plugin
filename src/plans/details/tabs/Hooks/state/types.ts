export type HookEditFormValues = {
  enabled: boolean;
  image: string;
  playbook: string;
};

export enum HookField {
  Enabled = 'enabled',
  Image = 'image',
  Playbook = 'playbook',
}
