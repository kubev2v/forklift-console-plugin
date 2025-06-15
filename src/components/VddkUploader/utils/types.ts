import type { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

export type UploadTarballResponse = {
  'build-name': string;
  message: string;
  status: string;
};

export type VddkBuild = K8sResourceKind & {
  status: K8sResourceKind['status'] & {
    outputDockerImageReference: string;
    output: {
      to?: {
        imageDigest: string;
      };
    };
    logSnippet?: string;
  };
};

export const vddkBuildResponseVariant = {
  info: 'info',
  success: 'success',
  warning: 'warning',
} as const;

type VddkBuildResponseVariant =
  (typeof vddkBuildResponseVariant)[keyof typeof vddkBuildResponseVariant];

export type VddkBuildResponse = {
  variant: VddkBuildResponseVariant;
  title?: string;
  body: string;
  isBuildSucceeded?: boolean;
  isBuildFailed?: boolean;
  isBuilding?: boolean;
};
