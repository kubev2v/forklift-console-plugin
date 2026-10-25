import { CopyApplianceTemplateModel, type V1beta1Provider } from '@forklift-ui/types';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';
import { getCopyApplianceTemplateName } from '@utils/crds/providers/selectors';
import { useForkliftTranslation } from '@utils/i18n';

export const useCopyApplianceTemplateAccess = (
  provider: V1beta1Provider,
  operation: 'create' | 'delete' | undefined,
): { loading: boolean; permissionError?: string } => {
  const { t } = useForkliftTranslation();
  const accessRequest = {
    group: CopyApplianceTemplateModel.apiGroup,
    namespace: getNamespace(provider),
    resource: CopyApplianceTemplateModel.plural,
  };
  const createAccess = useAccessReview({ ...accessRequest, verb: 'create' });
  const deleteAccess = useAccessReview({
    ...accessRequest,
    name: getCopyApplianceTemplateName(provider),
    verb: 'delete',
  });
  if (!operation) {
    return { loading: false };
  }
  const [allowed, loading] = operation === 'create' ? createAccess : deleteAccess;
  if (allowed || loading) {
    return { loading };
  }
  return {
    loading,
    permissionError:
      operation === 'create'
        ? t('You do not have permission to create a copy appliance template.')
        : t('You do not have permission to delete the copy appliance template.'),
  };
};
