import type { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

export type UploadTarballResponse = {
  'build-name': string;
  message: string;
  status: string;
};

export type VddkBuild = K8sResourceKind & {
  status: K8sResourceKind['status'] & {
    logSnippet?: string;
    output: {
      to?: {
        imageDigest: string;
      };
    };
    outputDockerImageReference: string;
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
  body: string;
  isBuildFailed?: boolean;
  isBuilding?: boolean;
  isBuildSucceeded?: boolean;
  title?: string;
  variant: VddkBuildResponseVariant;
};
