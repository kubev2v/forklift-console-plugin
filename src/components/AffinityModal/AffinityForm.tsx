import { type Dispatch, type FC, type SetStateAction, useEffect } from 'react';

import { Content, ContentVariants, Divider, Form } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { isTermsInvalid } from './utils/isTermsInvalid';
import {
  AffinityCondition,
  type AffinityRowData,
  AffinityType,
  type useIDEntitiesValue,
} from './utils/types';
import AffinityConditionSelect from './AffinityConditionSelect';
import AffinityTypeSelect from './AffinityTypeSelect';
import ExpressionEditList from './ExpressionEditList';
import FieldsEditList from './FieldsEditList';
import NodeExpressionDescriptionText from './NodeExpressionDescriptionText';
import NodeFieldsDescriptionText from './NodeFieldsDescriptionText';
import PreferredAffinityWeightInput from './PreferredAffinityWeightInput';
import TopologyKeyInput from './TopologyKeyInput';
import WorkloadExpressionDescriptionText from './WorkloadExpressionDescriptionText';

type AffinityFormProps = {
  expressions: useIDEntitiesValue;
  fields: useIDEntitiesValue;
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
};

const AffinityForm: FC<AffinityFormProps> = ({
  expressions,
  fields,
  focusedAffinity,
  setFocusedAffinity,
  setSubmitDisabled,
}) => {
  const { t } = useForkliftTranslation();

  const isNodeAffinity = focusedAffinity?.type === AffinityType.node;

  useEffect(() => {
    setSubmitDisabled(
      (isEmpty(expressions?.entities) && isEmpty(fields?.entities)) ||
        isTermsInvalid(expressions?.entities) ||
        isTermsInvalid(fields?.entities),
    );
  }, [expressions, fields, setSubmitDisabled]);

  return (
    <Form>
      <Content className="text-muted" component={ContentVariants.p}>
        {t(
          'Define an affinity rule. This rule will be added to the list of affinity rules applied to this workload.',
        )}
      </Content>
      <AffinityTypeSelect
        focusedAffinity={focusedAffinity}
        setFocusedAffinity={setFocusedAffinity}
      />
      <AffinityConditionSelect
        focusedAffinity={focusedAffinity}
        setFocusedAffinity={setFocusedAffinity}
      />
      {focusedAffinity?.condition === AffinityCondition.preferred && (
        <PreferredAffinityWeightInput
          focusedAffinity={focusedAffinity}
          setFocusedAffinity={setFocusedAffinity}
          setSubmitDisabled={setSubmitDisabled}
        />
      )}
      {!isNodeAffinity && (
        <TopologyKeyInput
          focusedAffinity={focusedAffinity}
          setFocusedAffinity={setFocusedAffinity}
          setSubmitDisabled={setSubmitDisabled}
        />
      )}
      <Divider />
      <ExpressionEditList
        errorHelperText={t('Missing fields in {{kind}} labels', {
          kind: isNodeAffinity ? 'node' : 'workload',
        })}
        helperText={
          isNodeAffinity ? <NodeExpressionDescriptionText /> : <WorkloadExpressionDescriptionText />
        }
        expressions={expressions}
        label={isNodeAffinity ? t('Node labels') : t('Workload labels')}
      />
      {isNodeAffinity && (
        <>
          <Divider />
          <FieldsEditList
            errorHelperText={t('Missing fields in node fields')}
            fields={fields}
            helperText={<NodeFieldsDescriptionText />}
            label={t('Node fields')}
          />
        </>
      )}{' '}
    </Form>
  );
};
export default AffinityForm;
