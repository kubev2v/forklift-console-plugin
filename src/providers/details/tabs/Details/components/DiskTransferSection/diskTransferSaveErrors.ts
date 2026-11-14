import type { DiskTransferSaveError } from './types';

const NOT_FOUND_STATUS_CODE = 404;

export const isNotFound = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const apiError = error as { code?: number | string; status?: number | string };
  return (
    String(apiError.code) === String(NOT_FOUND_STATUS_CODE) ||
    String(apiError.status) === String(NOT_FOUND_STATUS_CODE)
  );
};

export const createDiskTransferSaveError = (
  message: string,
  templateDeleted: boolean,
): DiskTransferSaveError => Object.assign(new Error(message), { templateDeleted });

export const wasCopyApplianceTemplateDeleted = (error: unknown): boolean =>
  error instanceof Error && 'templateDeleted' in error && error.templateDeleted === true;
