import { DISK_TRANSFER_METHOD_ANNOTATION } from 'src/providers/utils/constants';

export const SETTINGS_PATH = '/spec/settings';
export const ANNOTATIONS_PATH = '/metadata/annotations';
export const METHOD_PATH = `${ANNOTATIONS_PATH}/${DISK_TRANSFER_METHOD_ANNOTATION.replaceAll('/', '~1')}`;
