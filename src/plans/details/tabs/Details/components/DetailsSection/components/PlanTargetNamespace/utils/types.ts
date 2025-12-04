export type TargetNamespaceSelectInputProps = {
  value: string;
  onChange: (val: string) => void;
};

export type TargetNamespaceSelectProps = {
  projectNames: string[];
  errorMessage?: string;
} & TargetNamespaceSelectInputProps;
