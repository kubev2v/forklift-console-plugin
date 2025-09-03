type IDEntity = {
  id: number;
};

export type LabelFields = IDEntity & {
  key: string;
  value?: string;
};
