/** Unified file containing typed provider secrets */

import { OpenshiftVM, OpenstackVM, OvaVM, OVirtVM, VSphereVM } from './provider';

/**
 * General provider virtual machine inventory
 */
export type ProviderVirtualMachine = OpenshiftVM | OVirtVM | VSphereVM | OpenstackVM | OvaVM;
