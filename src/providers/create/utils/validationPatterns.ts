// NFS path format: host:/path (e.g., "10.10.0.10:/ova" or "nfs-server.example.com:/data")
export const NFS_PATH_REGEX = /^(?:[\w.-]+|\d{1,3}(?:\.\d{1,3}){3}):\/[\w./-]*$/u;

// SMB path formats:
// Unix format: //server/share (e.g., "//10.10.0.10/VMShare" or "//server.example.com/share")
const SMB_PATH_PATTERN_UNIX = /^\/\/[a-zA-Z0-9._-]+\/.+$/u;

// Windows format: \\server\share (e.g., "\\10.10.0.10\VMShare" or "\\server.example.com\share")
const SMB_PATH_PATTERN_WINDOWS = /^\\\\[a-zA-Z0-9._-]+\\.+$/u;

/**
 * Validates SMB path in either Unix (//server/share) or Windows (\\server\share) format
 */
export const isValidSmbPath = (path: string): boolean => {
  return SMB_PATH_PATTERN_UNIX.test(path) || SMB_PATH_PATTERN_WINDOWS.test(path);
};
