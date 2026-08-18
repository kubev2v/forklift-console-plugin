import { BaseResourceManager } from './resource-manager/BaseResourceManager';
import { API_PATHS, MTV_NAMESPACE } from './resource-manager/constants';

const TERMINAL_PHASES = new Set(['Succeeded', 'Failed', 'Canceled']);
const DEFAULT_POLL_MS = 10_000;
/** Bound wait so cleanup cannot hang forever; product hangs still fail earlier UI asserts. */
const DEFAULT_TIMEOUT_MS = 15 * 60_000;

type ConversionItem = {
  metadata?: {
    labels?: Record<string, string>;
    name?: string;
  };
  spec?: {
    connection?: { secret?: { name?: string } };
    vm?: { name?: string };
  };
  status?: {
    phase?: string;
    stage?: string;
  };
};

type ConversionList = {
  items?: ConversionItem[];
};

type WaitOptions = {
  namespace?: string;
  pollMs?: number;
  timeoutMs?: number;
};

const listConversions = async (namespace: string): Promise<ConversionItem[]> => {
  const path = `${API_PATHS.FORKLIFT}/namespaces/${namespace}/conversions`;
  const list = await BaseResourceManager.apiGet<ConversionList>(path);
  return list?.items ?? [];
};

const isTerminal = (conversion: ConversionItem): boolean =>
  TERMINAL_PHASES.has(conversion.status?.phase ?? '');

const formatNonTerminal = (items: ConversionItem[]): string =>
  items
    .map(
      (item) =>
        `${item.metadata?.name ?? '?'} phase=${item.status?.phase ?? '?'} stage=${item.status?.stage ?? '?'}`,
    )
    .join('; ');

const pollUntilTerminal = async (
  describe: string,
  filter: (item: ConversionItem) => boolean,
  options: WaitOptions = {},
): Promise<void> => {
  const namespace = options.namespace ?? MTV_NAMESPACE;
  const pollMs = options.pollMs ?? DEFAULT_POLL_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const matching = (await listConversions(namespace)).filter(filter);
    const active = matching.filter((item) => !isTerminal(item));

    if (active.length === 0) {
      return;
    }

    if (Date.now() >= deadline) {
      console.warn(
        `Timed out waiting for ${describe} Conversions to reach a terminal phase: ${formatNonTerminal(active)}`,
      );
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, pollMs);
    });
  }
};

/**
 * Wait until DeepInspection Conversions for a VM are Succeeded/Failed/Canceled.
 * UI can show a completed label while the Conversion is still RemovingSnapshot.
 */
export const waitForVmDeepInspectionsTerminal = async (
  vmName: string,
  options?: WaitOptions,
): Promise<void> => {
  const namePrefix = `deep-inspection-${vmName}-`;
  await pollUntilTerminal(
    `VM ${vmName}`,
    (item) =>
      item.spec?.vm?.name === vmName || (item.metadata?.name?.startsWith(namePrefix) ?? false),
    options,
  );
};

/**
 * Wait until Conversions that use a provider's connection Secret are terminal
 * before deleting the provider/secret (avoids RemovingSnapshot secret-not-found).
 */
export const waitForProviderDeepInspectionsTerminal = async (
  providerName: string,
  options?: WaitOptions,
): Promise<void> => {
  const namespace = options?.namespace ?? MTV_NAMESPACE;
  const providerPath = `${API_PATHS.FORKLIFT}/namespaces/${namespace}/providers/${providerName}`;
  const provider = await BaseResourceManager.apiGet<{
    metadata?: { uid?: string };
    spec?: { secret?: { name?: string } };
  }>(providerPath);

  const providerUid = provider?.metadata?.uid;
  const secretName = provider?.spec?.secret?.name;

  await pollUntilTerminal(
    `provider ${providerName}`,
    (item) => {
      if (providerUid && item.metadata?.labels?.provider === providerUid) {
        return true;
      }
      if (secretName && item.spec?.connection?.secret?.name === secretName) {
        return true;
      }
      return false;
    },
    options,
  );
};
