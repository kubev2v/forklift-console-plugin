import { BaseResourceManager } from './resource-manager/BaseResourceManager';
import { API_PATHS, MTV_NAMESPACE } from './resource-manager/constants';

const TERMINAL_PHASES = new Set(['Succeeded', 'Failed', 'Canceled']);
const SNAPSHOT_CLEANUP_STAGES = new Set(['RemovingSnapshot', 'WaitingForSnapshotRemoval']);
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

type PollUntilTerminalOptions = WaitOptions & {
  /**
   * When true, an empty list is not "done" — keep polling until a matching
   * Conversion has been seen and is settled. Use after an inspect was submitted.
   * Provider teardown leaves this false so tests that never inspect can finish.
   */
  requireSeen?: boolean;
};

const delay = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const listConversions = async (namespace: string): Promise<ConversionItem[]> => {
  const path = `${API_PATHS.FORKLIFT}/namespaces/${namespace}/conversions`;
  const list = await BaseResourceManager.apiGet<ConversionList>(path);
  if (list === null) {
    throw new Error(`GET ${path} failed`);
  }
  return list.items ?? [];
};

type ListResult = { error: unknown; ok: false } | { items: ConversionItem[]; ok: true };

const tryListConversions = async (namespace: string): Promise<ListResult> => {
  try {
    return { items: await listConversions(namespace), ok: true };
  } catch (error) {
    return { error, ok: false };
  }
};

const isSettled = (conversion: ConversionItem): boolean => {
  const stage = conversion.status?.stage ?? '';
  if (SNAPSHOT_CLEANUP_STAGES.has(stage)) {
    return false;
  }
  return TERMINAL_PHASES.has(conversion.status?.phase ?? '');
};

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
  options: PollUntilTerminalOptions = {},
): Promise<void> => {
  const namespace = options.namespace ?? MTV_NAMESPACE;
  const pollMs = options.pollMs ?? DEFAULT_POLL_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const requireSeen = options.requireSeen ?? false;
  const deadline = Date.now() + timeoutMs;
  let seenMatching = false;

  for (;;) {
    const listed = await tryListConversions(namespace);

    if (listed.ok) {
      const matching = listed.items.filter(filter);
      if (matching.length > 0) {
        seenMatching = true;
      }

      const active = matching.filter((item) => !isSettled(item));
      const canFinish = active.length === 0 && (!requireSeen || seenMatching);

      if (canFinish) {
        return;
      }

      if (Date.now() >= deadline) {
        const detail =
          active.length > 0 ? formatNonTerminal(active) : 'no matching Conversion seen';
        throw new Error(
          `Timed out waiting for ${describe} Conversions to reach a terminal phase: ${detail}`,
        );
      }
    } else if (Date.now() >= deadline) {
      const getError = listed.error instanceof Error ? listed.error.message : String(listed.error);
      throw new Error(
        `Timed out waiting for ${describe} Conversions to reach a terminal phase: GET failed (${getError})`,
        { cause: listed.error },
      );
    }

    await delay(pollMs);
  }
};

/**
 * Wait until DeepInspection Conversions for a VM are Succeeded/Failed/Canceled
 * and snapshot cleanup stages have finished.
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
    { ...options, requireSeen: true },
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

  if (!provider) {
    throw new Error(`Failed to GET provider ${providerName} before waiting for Conversions`);
  }

  const providerUid = provider.metadata?.uid;
  const secretName = provider.spec?.secret?.name;

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
