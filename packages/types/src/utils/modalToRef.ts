import { K8sModel } from "@openshift-console/dynamic-plugin-sdk/lib/api/common-types";

const modelToRef = (obj: K8sModel) =>
  `${obj.apiGroup}~${obj.apiVersion}~${obj.kind}`;

export { modelToRef };
