---
description: Use selectors for K8s resource property access
globs: "**/*.{ts,tsx}"
alwaysApply: false
---

# Selector Usage Rule

When accessing properties of Kubernetes resources (CRDs, Pods, Secrets, etc.), always use a selector function instead of direct property chains.

## Common selectors (`@utils/crds/common/selectors`)

Available for all `K8sResourceCommon` resources:
- `getName(resource)` instead of `resource?.metadata?.name`
- `getNamespace(resource)` instead of `resource?.metadata?.namespace`
- `getUID(resource)` instead of `resource?.metadata?.uid`
- `getCreatedAt(resource)` instead of `resource?.metadata?.creationTimestamp`
- `getLabels(resource)` instead of `resource?.metadata?.labels`
- `getAnnotations(resource)` instead of `resource?.metadata?.annotations`
- `getApiVersion(resource)` instead of `resource?.apiVersion`
- `getKind(resource)` instead of `resource?.kind`

Provider-specific:
- `getType(provider)` instead of `provider?.spec?.type`
- `getProviderSecretRef(provider)` instead of `provider?.spec?.secret`
- `getVddkInitImage(provider)` instead of `provider?.spec?.settings?.vddkInitImage`

## CRD-specific selectors

If a property access is specific to a CRD (e.g., Conversion, Plan), check for existing selectors under `@utils/crds/<crd>/selectors.ts`.

## When no selector exists

1. If the property is common to all K8s resources, add it to `src/utils/crds/common/selectors.ts`
2. If the property is CRD-specific, add it to the CRD's selectors file under `src/utils/crds/<crd>/selectors.ts`
3. Never access `metadata.*` or `spec.*` or `status.*` directly in component or hook code
