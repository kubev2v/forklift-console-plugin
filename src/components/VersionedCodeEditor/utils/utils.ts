const parseOcpVersion = (version?: string): number[] =>
  version?.split('.').map((versionSection) => parseInt(versionSection, 10)) ?? [];

export const isVersionGte = (actual: string | undefined, target: string): boolean => {
  const [aMajor = 0, aMinor = 0] = parseOcpVersion(actual);
  const [tMajor = 0, tMinor = 0] = parseOcpVersion(target);
  return aMajor > tMajor || (aMajor === tMajor && aMinor >= tMinor);
};
