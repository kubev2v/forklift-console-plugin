import { exec } from 'child_process';
import { readdir, rm, rmdir } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface NfsCleanupConfig {
  server: string;
  remotePath: string;
  fileName: string;
  sshUser?: string;
  sshKey?: string;
}

interface NfsUrlComponents {
  server: string;
  path: string;
}

const parseNfsUrl = (nfsUrl: string): NfsUrlComponents => {
  if (nfsUrl.includes(':/') && !nfsUrl.startsWith('nfs://')) {
    const [server, path] = nfsUrl.split(':');
    return { server: server.trim(), path: path.trim() };
  }

  if (nfsUrl.startsWith('nfs://')) {
    const url = new URL(nfsUrl);
    return { server: url.hostname, path: url.pathname };
  }

  throw new Error(
    `Invalid NFS URL format: ${nfsUrl}. Expected "server:/path" or "nfs://server/path"`,
  );
};

/**
 * NfsCleanupManager handles cleanup of uploaded OVA files from NFS server
 */
export class NfsCleanupManager {
  private cleanupTasks: NfsCleanupConfig[] = [];
  private readonly nfsMountPath: string | undefined;

  constructor(nfsMountPath?: string) {
    this.nfsMountPath = nfsMountPath ?? process.env.NFS_MOUNT_PATH;
  }

  private async directCleanup(config: NfsCleanupConfig): Promise<void> {
    const { fileName } = config;
    const mountPath = this.nfsMountPath!;

    const filePath = await this.findFile(mountPath, fileName);

    if (!filePath) {
      return;
    }

    await rm(filePath, { force: true });

    const applianceDir = join(filePath, '..');
    try {
      await rmdir(applianceDir);
    } catch (error) {
      // Directory not empty
    }
  }

  private async findFile(dir: string, fileName: string): Promise<string | null> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          const found = await this.findFile(fullPath, fileName);
          if (found) return found;
        } else if (entry.name === fileName) {
          return fullPath;
        }
      }
    } catch (error) {
      // Skip directories with permission errors
    }

    return null;
  }

  private async mountCleanup(config: NfsCleanupConfig): Promise<void> {
    const { fileName } = config;
    const scriptPath = `${process.cwd()}/cleanup-ova.sh`;

    const env = {
      ...process.env,
      NFS_SERVER: config.server,
      NFS_PATH: config.remotePath,
      OVA_FILE: fileName,
    };

    await execAsync(`bash ${scriptPath}`, { env });
  }

  private async sshCleanup(config: NfsCleanupConfig): Promise<void> {
    const { server, remotePath, fileName, sshUser, sshKey } = config;

    const sshKeyArg = sshKey ? `-i ${sshKey}` : '';
    const sshBase = `ssh ${sshKeyArg} -o StrictHostKeyChecking=no ${sshUser}@${server}`;

    const findCmd = `${sshBase} "find ${remotePath} -name '${fileName}' 2>/dev/null"`;
    const { stdout: filePath } = await execAsync(findCmd);

    if (!filePath.trim()) {
      return;
    }

    const ovaPath = filePath.trim();

    const deleteFileCmd = `${sshBase} "rm -f '${ovaPath}'"`;
    await execAsync(deleteFileCmd);

    const applianceDir = ovaPath.substring(0, ovaPath.lastIndexOf('/'));
    const deleteDirCmd = `${sshBase} "rmdir '${applianceDir}' 2>/dev/null || true"`;
    await execAsync(deleteDirCmd);
  }

  addOvaFile(fileName: string, config?: Partial<NfsCleanupConfig>): void {
    const defaultConfig: NfsCleanupConfig = {
      server: process.env.NFS_SERVER ?? 'f02-h06-000-r640.rdu2.scalelab.redhat.com',
      remotePath: process.env.NFS_PATH ?? '/home/nfsshare-test/ova',
      fileName,
      sshUser: process.env.NFS_SSH_USER ?? 'root',
      sshKey: process.env.NFS_SSH_KEY,
    };

    this.cleanupTasks.push({ ...defaultConfig, ...config });
  }

  addOvaFileFromUrl(fileName: string, nfsUrl: string): void {
    const { server, path } = parseNfsUrl(nfsUrl);

    const config: NfsCleanupConfig = {
      server,
      remotePath: path,
      fileName,
      sshUser: process.env.NFS_SSH_USER ?? 'root',
      sshKey: process.env.NFS_SSH_KEY,
    };

    this.cleanupTasks.push(config);
  }

  async cleanupAll(): Promise<void> {
    if (!this.cleanupTasks.length) {
      return;
    }

    if (this.nfsMountPath) {
      await this.cleanupDirect();
      return;
    }

    await this.cleanupViaMount();
  }

  async cleanupDirect(): Promise<void> {
    if (!this.nfsMountPath) {
      throw new Error('Direct cleanup requires NFS_MOUNT_PATH to be set');
    }

    for (const task of this.cleanupTasks) {
      try {
        await this.directCleanup(task);
      } catch (error) {
        console.error(`Failed to cleanup ${task.fileName}:`, error);
      }
    }

    this.cleanupTasks = [];
  }

  async cleanupViaMount(): Promise<void> {
    for (const task of this.cleanupTasks) {
      try {
        await this.mountCleanup(task);
      } catch (error) {
        console.error(`Failed to cleanup ${task.fileName}:`, error);
      }
    }

    this.cleanupTasks = [];
  }

  async cleanupViaSsh(): Promise<void> {
    for (const task of this.cleanupTasks) {
      try {
        await this.sshCleanup(task);
      } catch (error) {
        console.error(`Failed to cleanup ${task.fileName}:`, error);
      }
    }

    this.cleanupTasks = [];
  }

  clearTasks(): void {
    this.cleanupTasks = [];
  }

  getPendingCleanupCount(): number {
    return this.cleanupTasks.length;
  }

  async instantCleanup(): Promise<void> {
    if (!this.cleanupTasks.length) {
      return;
    }

    await this.cleanupAll();
  }
}
