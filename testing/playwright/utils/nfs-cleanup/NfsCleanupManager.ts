import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { isEmpty } from '../utils';

const execAsync = promisify(exec);

interface NfsCleanupConfig {
  server: string;
  remotePath: string;
  fileName: string;
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

export class NfsCleanupManager {
  private cleanupTasks: NfsCleanupConfig[] = [];

  private async mountCleanup(config: NfsCleanupConfig): Promise<void> {
    const { server, remotePath, fileName } = config;
    const scriptPath = `${process.cwd()}/cleanup-ova.sh`;

    const env = {
      ...process.env,
      NFS_SERVER: server,
      NFS_PATH: remotePath,
      OVA_FILE: fileName,
    };

    await execAsync(`bash ${scriptPath}`, { env });
  }

  addOvaFileFromUrl(fileName: string, nfsUrl: string): void {
    const { server, path } = parseNfsUrl(nfsUrl);

    this.cleanupTasks.push({
      server,
      remotePath: path,
      fileName,
    });
  }

  async instantCleanup(): Promise<void> {
    if (isEmpty(this.cleanupTasks)) {
      return;
    }

    for (const task of this.cleanupTasks) {
      try {
        await this.mountCleanup(task);
      } catch (error) {
        console.error(`Failed to cleanup ${task.fileName}:`, error);
      }
    }

    this.cleanupTasks = [];
  }
}
