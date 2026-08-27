import type { ReactElement } from 'react';

import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  Operator: {
    DoesNotExist: 'DoesNotExist',
    Exists: 'Exists',
    In: 'In',
    NotIn: 'NotIn',
  },
}));

jest.mock('../AffinityTypeSelect', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="type-select" />,
}));

jest.mock('../AffinityConditionSelect', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="condition-select" />,
}));

jest.mock('../ExpressionEditList', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="expression-edit-list" />,
}));

jest.mock('../FieldsEditList', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="fields-edit-list" />,
}));

import { render } from '@testing-library/react';

import AffinityForm from '../AffinityForm';
import {
  AffinityCondition,
  type AffinityLabel,
  type AffinityRowData,
  AffinityType,
  type UseIDEntitiesValue,
} from '../utils/types';

const validExpression: AffinityLabel = {
  id: 0,
  key: 'app',
  operator: 'Exists',
  values: [],
};

const entities = (list: AffinityLabel[]): UseIDEntitiesValue => ({
  entities: list,
  initialEntitiesChanged: false,
  onEntityAdd: jest.fn(),
  onEntityChange: jest.fn(),
  onEntityDelete: jest.fn(),
  setEntities: jest.fn(),
});

const preferredPod: AffinityRowData = {
  condition: AffinityCondition.Preferred,
  id: '1',
  topologyKey: 'kubernetes.io/hostname',
  type: AffinityType.Pod,
  weight: 50,
};

describe('AffinityForm - submit gating', () => {
  it('keeps submit disabled for invalid preferred weight despite valid expressions', () => {
    const setSubmitDisabled = jest.fn();

    render(
      <AffinityForm
        expressions={entities([validExpression])}
        fields={entities([])}
        focusedAffinity={{ ...preferredPod, weight: 0 }}
        setFocusedAffinity={jest.fn()}
        setSubmitDisabled={setSubmitDisabled}
      />,
    );

    expect(setSubmitDisabled).toHaveBeenLastCalledWith(true);
  });

  it('keeps submit disabled for empty topology key despite valid expressions', () => {
    const setSubmitDisabled = jest.fn();

    render(
      <AffinityForm
        expressions={entities([validExpression])}
        fields={entities([])}
        focusedAffinity={{ ...preferredPod, topologyKey: '' }}
        setFocusedAffinity={jest.fn()}
        setSubmitDisabled={setSubmitDisabled}
      />,
    );

    expect(setSubmitDisabled).toHaveBeenLastCalledWith(true);
  });

  it('enables submit when preferred pod rule is fully valid', () => {
    const setSubmitDisabled = jest.fn();

    render(
      <AffinityForm
        expressions={entities([validExpression])}
        fields={entities([])}
        focusedAffinity={preferredPod}
        setFocusedAffinity={jest.fn()}
        setSubmitDisabled={setSubmitDisabled}
      />,
    );

    expect(setSubmitDisabled).toHaveBeenLastCalledWith(false);
  });
});
