import { K8sResourceCondition, V1beta1ForkliftController } from '@kubev2v/types';

/**
 * This function gets the phase and corresponding message from a status object.
 * @param {Object} status - The status object from which to extract the phase and message.
 * @return {Object} A dictionary with the phase as the key and the message as the value.
 */
export function getPhase(obj: V1beta1ForkliftController): { phase?: string; message?: string } {
  let phase: string;
  let message: string;

  const status: { conditions?: K8sResourceCondition[] } = obj?.status || {};

  // Define an array of valid types
  const validTypes = ['Running', 'Successful', 'Failure'];

  // Check if conditions exist in status
  if ('conditions' in status) {
    for (const condition of status?.conditions || []) {
      // Check if the type of condition is valid
      if (validTypes.includes(condition['type'])) {
        // Check the status and add the phase as key and message as value
        if (condition['status'] == 'True') {
          phase = condition['type'];
          message = condition['message'];

          break;
        }
      }
    }
  }

  return { phase, message };
}
