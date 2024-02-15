/* tslint:disable */
/* eslint-disable */
/**
 * Kubernetes
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: unversioned
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../../runtime';
/**
 * Represents an NFS mount that lasts the lifetime of a pod. NFS volumes do not support ownership management or SELinux relabeling.
 * @export
 * @interface IoK8sApiCoreV1NFSVolumeSource
 */
export interface IoK8sApiCoreV1NFSVolumeSource {
    /**
     * path that is exported by the NFS server. More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs
     * @type {string}
     * @memberof IoK8sApiCoreV1NFSVolumeSource
     */
    path: string;
    /**
     * readOnly here will force the NFS export to be mounted with read-only permissions. Defaults to false. More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs
     * @type {boolean}
     * @memberof IoK8sApiCoreV1NFSVolumeSource
     */
    readOnly?: boolean;
    /**
     * server is the hostname or IP address of the NFS server. More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs
     * @type {string}
     * @memberof IoK8sApiCoreV1NFSVolumeSource
     */
    server: string;
}

/**
 * Check if a given object implements the IoK8sApiCoreV1NFSVolumeSource interface.
 */
export function instanceOfIoK8sApiCoreV1NFSVolumeSource(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "path" in value;
    isInstance = isInstance && "server" in value;

    return isInstance;
}

export function IoK8sApiCoreV1NFSVolumeSourceFromJSON(json: any): IoK8sApiCoreV1NFSVolumeSource {
    return IoK8sApiCoreV1NFSVolumeSourceFromJSONTyped(json, false);
}

export function IoK8sApiCoreV1NFSVolumeSourceFromJSONTyped(json: any, ignoreDiscriminator: boolean): IoK8sApiCoreV1NFSVolumeSource {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'path': json['path'],
        'readOnly': !exists(json, 'readOnly') ? undefined : json['readOnly'],
        'server': json['server'],
    };
}

export function IoK8sApiCoreV1NFSVolumeSourceToJSON(value?: IoK8sApiCoreV1NFSVolumeSource | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'path': value.path,
        'readOnly': value.readOnly,
        'server': value.server,
    };
}
