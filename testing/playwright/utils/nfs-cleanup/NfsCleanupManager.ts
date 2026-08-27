import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { testError, testLog } from '../testLog';
import { isEmpty } from '../utils';

const execAsync = promisify(exec);

type NfsCleanupConfig = {
  fileName: string;
  remotePath: string;
  server: string;
};

type NfsUrlComponents = {
  path: string;
  server: string;
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const parseNfsUrl = (nfsUrl: string): NfsUrlComponents => {
  if (nfsUrl.includes(':/') && !nfsUrl.startsWith('nfs://')) {
    const [server, path] = nfsUrl.split(':');
    return { path: path.trim(), server: server.trim() };
  }

  if (nfsUrl.startsWith('nfs://')) {
    const url = new URL(nfsUrl);
    return { path: url.pathname, server: url.hostname };
  }

  throw new Error(
    `Invalid NFS URL format: ${nfsUrl}. Expected "server:/path" or "nfs://server/path"`,
  );
};

const mountCleanup = async (config: NfsCleanupConfig): Promise<void> => {
  const { fileName, remotePath, server } = config;
  const scriptPath = `${__dirname}/cleanup-ova.sh`;
  const env = {
    ...process.env,
    NFS_PATH: remotePath,
    NFS_SERVER: server,
    OVA_FILE: fileName,
  };

  try {
    await execAsync(`bash ${scriptPath}`, { env });
    testLog(`Successfully cleaned up ${fileName} from NFS server`);
  } catch (error: unknown) {
    testError(`Failed to cleanup ${fileName}:`, getErrorMessage(error));
    throw error;
  }
};

export class NfsCleanupManager {
  private cleanupTasks: NfsCleanupConfig[] = [];

  addOvaFileFromUrl(fileName: string, nfsUrl: string): void {
    const { path, server } = parseNfsUrl(nfsUrl);

    this.cleanupTasks.push({
      fileName,
      remotePath: path,
      server,
    });
  }

  async instantCleanup(): Promise<void> {
    if (isEmpty(this.cleanupTasks)) {
      return;
    }

    for (const task of this.cleanupTasks) {
      try {
        await mountCleanup(task);
      } catch (error: unknown) {
        testError(`Failed to cleanup ${task.fileName}:`, error);
      }
    }

    this.cleanupTasks = [];
  }
}
