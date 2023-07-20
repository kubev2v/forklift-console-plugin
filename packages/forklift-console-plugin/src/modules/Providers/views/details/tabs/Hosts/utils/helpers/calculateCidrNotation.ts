/**
 * Method to calculate the CIDR notation from an IP and a subnet mask.
 * @param ip - The IPv4 address as a string (e.g., "192.168.0.1").
 * @param subnetMask - The subnet mask as a string (e.g., "255.255.255.0").
 * @returns - The CIDR notation as a string (e.g., "192.168.0.1/24").
 * @throws - If the subnet mask is not a valid IPv4 address.
 */
export function calculateCidrNotation(ip: string, subnetMask: string): string {
  // Split subnet mask into its respective octets.
  const maskOctets = subnetMask.split('.').map(Number);

  // Validate subnet mask.
  if (
    maskOctets.length !== 4 ||
    maskOctets.some((octet) => octet < 0 || octet > 255 || !Number.isInteger(octet))
  ) {
    throw new Error('Subnet mask must be a valid IPv4 address.');
  }

  // Calculate CIDR notation.
  const cidr = maskOctets
    .map((octet) => octet.toString(2).padStart(8, '0'))
    .join('')
    .split('0', 1)[0].length;

  return `${ip}/${cidr}`;
}
