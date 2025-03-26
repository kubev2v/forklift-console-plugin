import { K8sResourceCondition, V1beta1ForkliftController } from '@kubev2v/types';

/**
 * This function gets the phase and corresponding message from a status object.
 * @param {Object} status - The status object from which to extract the phase and message.
 * @return {Object} A dictionary with the phase as the key and the message as the value.
 */
export function getOperatorPhase(obj: V1beta1ForkliftController): {
  phase?: string;
  message?: string;
} {
  let phase: string;
  let message: string;

  const status: { conditions?: K8sResourceCondition[] } = obj?.status || {};

  // Define an array of valid types
  const validTypes = ['Successful', 'Failure', 'Running'];

  // Prepare an empty map to store found condition types and their associated messages
  const foundConditions: { [key: string]: string } = {};

  // Check if conditions exist in status
  if ('conditions' in status) {
    for (const condition of status?.conditions || []) {
      // Check if the type of condition is valid and its status is 'True'
      if (validTypes.includes(condition['type']) && condition['status'] == 'True') {
        // Store the found condition type and its associated message
        foundConditions[condition['type']] = condition['message'];
      }
    }
  }

  // Iterate over the validTypes array to check if the conditions were found in the given order
  for (const type of validTypes) {
    if (type in foundConditions) {
      phase = type;
      message = foundConditions[type];
      break;
    }
  }

  return { phase, message };
}
