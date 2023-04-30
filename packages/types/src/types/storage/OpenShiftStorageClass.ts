import { IoK8sApiStorageV1StorageClass } from '../k8s/IoK8sApiStorageV1StorageClass';

/** Represents an OpenShift storage class. */
export interface OpenShiftStorageClass {
  /** The unique identifier (UID) of the storage class. */
  uid: string;
  /** The API version of the storage class. */
  version: string;
  /** The namespace in which the storage class is defined. */
  namespace: string;
  /** The display name of the storage class. */
  name: string;
  /** The self link of the storage class. */
  selfLink: string;
  /** The StorageClass object. */
  object: IoK8sApiStorageV1StorageClass;
}
