import { useFormContext } from 'react-hook-form';

import { renderHook } from '@testing-library/react';
import { NetworkMapFieldId } from '@utils/mappings/networkMap';

import { useInitializeMappings } from '../useInitializeMappings';

jest.mock('react-hook-form', (): unknown => ({
  useFormContext: jest.fn(),
}));

const mockSetValue = jest.fn();
const mockTrigger = jest.fn().mockResolvedValue(true);
const mockClearErrors = jest.fn();
const mockUseFormContext = useFormContext as jest.MockedFunction<typeof useFormContext>;
const fieldIds = {
  mapField: NetworkMapFieldId.NetworkMap,
  sourceField: NetworkMapFieldId.SourceNetwork,
  targetField: NetworkMapFieldId.TargetNetwork,
};
const defaultTarget = { name: 'Default network' };

describe('useInitializeMappings - source identity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseFormContext.mockReturnValue({
      clearErrors: mockClearErrors,
      setValue: mockSetValue,
      trigger: mockTrigger,
    } as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('hydrates a legacy mapped source by name without adding a duplicate row', () => {
    renderHook(() => {
      useInitializeMappings({
        currentMap: [
          {
            [NetworkMapFieldId.SourceNetwork]: { name: 'src-a' },
            [NetworkMapFieldId.TargetNetwork]: defaultTarget,
          },
        ],
        defaultTarget,
        fieldIds,
        isLoading: false,
        usedSources: [{ id: 'network-a', name: 'src-a' }],
      });
    });

    expect(mockSetValue).toHaveBeenCalledWith(
      NetworkMapFieldId.NetworkMap,
      [
        {
          [NetworkMapFieldId.SourceNetwork]: { id: 'network-a', name: 'src-a' },
          [NetworkMapFieldId.TargetNetwork]: defaultTarget,
        },
      ],
      { shouldDirty: false, shouldValidate: true },
    );
  });
});
