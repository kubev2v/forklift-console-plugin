// default return values
const OLD_DEV = [-1 ,0 ,0];
const DEV = [0, 0, 0]

// consoleVersion for 4.11 dev code was on the 20000 range:
// for example: v6.0.6-20465-gf354c93297
// on 4.12 it jumped to 21000:
// for example: v6.0.6-21012-gcc711bd0ea
// Note: this is not a documented or defined, fallback to this
//       check only when all other methods failed.
const OLD_CONSOLE_VERSION_PREFIX = 'v6.0.6-20';

/**
 * get console semantic version, from the console releaseVersion.
 * use git version (consoleVersion) as fallback way to guess release.
 * 
 * @param {string} releaseVersion is openshift console release value, available only for release
 * @param {string} consoleVersion is auto generated from git
 * 
 * @returns a tupple with the console release version, on none release it will return 0, 0, 0,
 *          on old development server, return -1, 0, 0
 */
export const getReleaseVersionSemanticVersioning = (releaseVersion, consoleVersion) => {
    if (!releaseVersion || typeof releaseVersion !== 'string') {
        // if we don't have releaseVersion try consoleVersion
        if (consoleVersion && typeof consoleVersion === 'string' && consoleVersion.startsWith(OLD_CONSOLE_VERSION_PREFIX)) {
            return OLD_DEV;
        }

        return DEV;
    }
    const [major, minor, bugfix] = releaseVersion.split('.').map((v) => parseInt(v, 10));

    return [major || 0, minor || 0, bugfix || 0]
}

/**
 * get the console release version
 * 
 * @returns a tupple with the console release version, on none release it will return 0, 0, 0,
 *          on old development server, return -1, 0, 0
 */
const getReleaseVersion = () => {
    const releaseVersion = window['SERVER_FLAGS']?.releaseVersion;
    const consoleVersion = window['SERVER_FLAGS']?.consoleVersion;

    return getReleaseVersionSemanticVersioning(releaseVersion, consoleVersion)
}

/**
 * Specific version check based on getReleaseVersion
 * 
 * @returns true if version is 4.11 or lower
 */
const isConsoleVersion_4_11 = () => {
    const [major, minor] = getReleaseVersion();

    if (major === 0) return false;
    if (major === -1) return true;

    return ((major === 4 && minor <= 11) || (major < 4));
};

export const IS_CONSOLE_VERSION_4_11 = isConsoleVersion_4_11();
