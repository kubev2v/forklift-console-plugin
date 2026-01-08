import { type FC, type ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import {
  type K8sGroupVersionKind,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { ALL_PROJECTS_KEY, Namespace } from '@utils/constants';
import { getResourceUrl } from '@utils/getResourceUrl';

import { getNavigationTarget } from './utils';

type LabelButtonProps = {
  href?: string;
  isCreateForm?: boolean;
  label: ReactNode;
  preText?: ReactNode;
  groupVersionKind?: K8sGroupVersionKind;
};

const LabelButton: FC<LabelButtonProps> = ({
  groupVersionKind,
  href,
  isCreateForm,
  label,
  preText,
}) => {
  const navigate = useNavigate();
  const [activeNamespace] = useActiveNamespace();
  const namespace = activeNamespace === ALL_PROJECTS_KEY ? Namespace.AllProjects : activeNamespace;

  const url =
    href ??
    getResourceUrl({
      groupVersionKind,
      namespace,
      namespaced: namespace !== Namespace.AllProjects,
    });

  const onClick = useCallback(() => {
    const navigationTarget = getNavigationTarget(href, isCreateForm, url);
    if (navigationTarget) {
      navigate(navigationTarget);
    }
  }, [navigate, href, isCreateForm, url]);
  return (
    <>
      {preText}
      <Label color="blue" className="pf-v6-u-ml-sm" onClick={onClick}>
        {label}
      </Label>
    </>
  );
};

export default LabelButton;
