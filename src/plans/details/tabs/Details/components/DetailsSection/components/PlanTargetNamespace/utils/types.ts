export type TargetNamespaceSelectInputProps = {
  onChange: (val: string) => void;
  value: string;
};

export type TargetNamespaceSelectProps = {
  errorMessage?: string;
  projectNames: string[];
} & TargetNamespaceSelectInputProps;
