// NFS path format: host:/path (e.g., "10.10.0.10:/ova" or "nfs-server.example.com:/data")
export const NFS_PATH_REGEX = /^(?:[\w.-]+|\d{1,3}(?:\.\d{1,3}){3}):\/[\w./-]*$/u;
