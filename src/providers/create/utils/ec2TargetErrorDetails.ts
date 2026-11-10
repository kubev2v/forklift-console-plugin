import { HTTP_FORBIDDEN, HTTP_NOT_FOUND } from '../fields/ec2/constants';

type ErrorRecord = Record<string, unknown>;

const FORBIDDEN_TEXT = 'forbidden';
const NOT_FOUND_TEXTS = ['notfound', 'not found'];

const isRecord = (value: unknown): value is ErrorRecord =>
  typeof value === 'object' && value !== null;

const parseHttpCode = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : undefined;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const getResponseStatus = (error: ErrorRecord): unknown =>
  isRecord(error.response) ? error.response.status : undefined;

const getStatusFromValues = (error: ErrorRecord): number | undefined => {
  const candidates = [error.status, error.statusCode, error.code, getResponseStatus(error)];

  for (const candidate of candidates) {
    const code = parseHttpCode(candidate);
    if (code !== undefined) {
      return code;
    }
  }

  return undefined;
};

const getStatusFromText = (error: ErrorRecord): number | undefined => {
  const texts = [error.message, error.reason]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.toLowerCase());

  if (texts.some((text) => text.includes(FORBIDDEN_TEXT))) {
    return HTTP_FORBIDDEN;
  }

  if (texts.some((text) => NOT_FOUND_TEXTS.some((needle) => text.includes(needle)))) {
    return HTTP_NOT_FOUND;
  }

  return undefined;
};

export const getEc2TargetErrorCode = (error: unknown): number | undefined => {
  if (!isRecord(error)) {
    return undefined;
  }

  return getStatusFromValues(error) ?? getStatusFromText(error);
};

export const getEc2TargetErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === 'string') {
    return error.trim() === '' ? undefined : error.trim();
  }

  if (!isRecord(error)) {
    return undefined;
  }

  const candidates = [error.message, error.reason];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return candidate.trim();
    }
  }

  return undefined;
};
