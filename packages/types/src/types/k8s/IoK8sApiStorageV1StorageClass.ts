import { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '../../models/IoK8sApimachineryPkgApisMetaV1ObjectMeta';

/**
 * StorageClass describes the parameters for a class of storage for which PersistentVolumes can be dynamically provisioned.
 *
 * StorageClasses are non-namespaced; the name of the storage class according to etcd is in ObjectMeta.Name.
 * @export
 * @interface IoK8sApiStorageV1StorageClass
 */
export interface IoK8sApiStorageV1StorageClass {
  /**
   * AllowVolumeExpansion shows whether the storage class allow volume expand
   * @type {boolean}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  allowVolumeExpansion?: boolean;
  /**
   * Restrict the node topologies where volumes can be dynamically provisioned. Each volume plugin defines its own supported topology specifications. An empty TopologySelectorTerm list means there is no topology restriction. This field is only honored by servers that enable the VolumeScheduling feature.
   * @type {Array<IoK8sApiCoreV1TopologySelectorTerm>}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  allowedTopologies?: Array<unknown>;
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   * @type {string}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  apiVersion?: string;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   * @type {string}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  kind?: string;
  /**
   *
   * @type {IoK8sApimachineryPkgApisMetaV1ObjectMeta}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
  /**
   * Dynamically provisioned PersistentVolumes of this storage class are created with these mountOptions, e.g. ["ro", "soft"]. Not validated - mount of the PVs will simply fail if one is invalid.
   * @type {Array<string>}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  mountOptions?: Array<string>;
  /**
   * Parameters holds the parameters for the provisioner that should create volumes of this storage class.
   * @type {{ [key: string]: string; }}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  parameters?: { [key: string]: string };
  /**
   * Provisioner indicates the type of the provisioner.
   * @type {string}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  provisioner: string;
  /**
   * Dynamically provisioned PersistentVolumes of this storage class are created with this reclaimPolicy. Defaults to Delete.
   * @type {string}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  reclaimPolicy?: string;
  /**
   * VolumeBindingMode indicates how PersistentVolumeClaims should be provisioned and bound.  When unset, VolumeBindingImmediate is used. This field is only honored by servers that enable the VolumeScheduling feature.
   * @type {string}
   * @memberof IoK8sApiStorageV1StorageClass
   */
  volumeBindingMode?: string;
}
