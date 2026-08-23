import { t } from '@utils/i18n';
import type { ValidationMsg } from '@utils/validation/Validation';

import { validateOpenstackRequiredNoSpacesField } from './validateOpenstackRequiredNoSpacesField';

export const validateUsername = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid username, spaces are not allowed`),
    requiredMsg: t(
      `A username for connecting to the OpenStack Identity (Keystone) endpoint. [required]`,
    ),
    successMsg: t(`A username for connecting to the OpenStack Identity (Keystone) endpoint.`),
  });

export const validatePassword = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid password, spaces are not allowed`),
    requiredMsg: t(
      `A user password for connecting to the OpenStack Identity (Keystone) endpoint. [required]`,
    ),
    successMsg: t(`A user password for connecting to the OpenStack Identity (Keystone) endpoint.`),
  });

export const validateRegionName = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid region, spaces are not allowed`),
    requiredMsg: t(`OpenStack region name. [required]`),
    successMsg: t(`OpenStack region name.`),
  });

export const validateProjectName = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid project name, spaces are not allowed`),
    requiredMsg: t(`OpenStack project name. [required]`),
    successMsg: t(`OpenStack project name.`),
  });

export const validateDomainName = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid domain name, spaces are not allowed`),
    requiredMsg: t(`OpenStack domain name. [required]`),
    successMsg: t(`OpenStack domain name.`),
  });

export const validateToken = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid token, spaces are not allowed`),
    requiredMsg: t(`OpenStack token for authentication using a user name. [required]`),
    successMsg: t(`OpenStack token for authentication using a user name.`),
  });

export const validateUserID = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid user ID, spaces are not allowed`),
    requiredMsg: t(
      `A user ID for connecting to the OpenStack Identity (Keystone) endpoint. [required]`,
    ),
    successMsg: t(`A user ID for connecting to the OpenStack Identity (Keystone) endpoint.`),
  });

export const validateProjectID = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid project ID, spaces are not allowed`),
    requiredMsg: t(`OpenStack project ID. [required]`),
    successMsg: t(`OpenStack project ID.`),
  });

export const validateApplicationCredentialID = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid application ID, spaces are not allowed`),
    requiredMsg: t(
      `OpenStack application credential ID needed for the application credential authentication. [required]`,
    ),
    successMsg: t(
      `OpenStack application credential ID needed for the application credential authentication.`,
    ),
  });

export const validateApplicationCredentialSecret = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid application secret, spaces are not allowed`),
    requiredMsg: t(
      `OpenStack application credential Secret needed for the application credential authentication. [required]`,
    ),
    successMsg: t(
      `OpenStack application credential Secret needed for the application credential authentication.`,
    ),
  });

export const validateApplicationCredentialName = (value: string): ValidationMsg =>
  validateOpenstackRequiredNoSpacesField(value, {
    invalidMsg: t(`Invalid application name, spaces are not allowed`),
    requiredMsg: t(
      `OpenStack application credential name needed for application credential authentication. [required]`,
    ),
    successMsg: t(
      `OpenStack application credential name needed for application credential authentication.`,
    ),
  });
