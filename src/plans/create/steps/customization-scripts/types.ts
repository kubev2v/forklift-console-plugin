import type { GuestType, ScriptType } from './constants';

export type CustomScript = {
  content: string;
  guestType: GuestType;
  name: string;
  order: number;
  scriptType: ScriptType;
};
