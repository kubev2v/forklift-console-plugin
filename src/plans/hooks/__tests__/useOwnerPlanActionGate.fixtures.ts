type OwnerReference = {
  apiVersion: string;
  kind: string;
  name: string;
  uid: string;
};

export const createResourceWithOwner = ({
  name = 'map1',
  namespace = 'ns1',
  ownerReferences,
}: {
  name?: string;
  namespace?: string;
  ownerReferences?: OwnerReference[];
}): { metadata: { name: string; namespace: string; ownerReferences?: OwnerReference[] } } => ({
  metadata: {
    name,
    namespace,
    ...(ownerReferences ? { ownerReferences } : {}),
  },
});

export const planOwnerReference = (planName: string, uid = 'uid-1'): OwnerReference => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  name: planName,
  uid,
});
