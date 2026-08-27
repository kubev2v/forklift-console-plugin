import { useFormContext } from 'react-hook-form';

import { renderHook } from '@testing-library/react';
import { NetworkMapFieldId } from '@utils/mappings/networkMap';

import { useInitializeMappings } from '../useInitializeMappings';

jest.mock('react-hook-form', (): unknown => ({
  useFormContext: jest.fn(),
}));

const mockSetValue = jest.fn();
const mockUseFormContext = useFormContext as jest.MockedFunction<typeof useFormContext>;

const fieldIds = {
  mapField: NetworkMapFieldId.NetworkMap,
  sourceField: NetworkMapFieldId.SourceNetwork,
  targetField: NetworkMapFieldId.TargetNetwork,
};

const defaultTarget = { name: 'Default network' };

describe('useInitializeMappings - sticky autoMap ref', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormContext.mockReturnValue({
      clearErrors: jest.fn(),
      setValue: mockSetValue,
      trigger: jest.fn().mockResolvedValue(true),
    } as never);
  });

  it('does not re-auto-map after user clears a previously auto-mapped source', () => {
    const emptyRow = {
      [NetworkMapFieldId.SourceNetwork]: { name: '' },
      [NetworkMapFieldId.TargetNetwork]: defaultTarget,
    };
    const usedSources = [{ id: '1', name: 'src-a' }];

    const { rerender } = renderHook(
      ({ currentMap }) => {
        useInitializeMappings({
          currentMap,
          defaultTarget,
          fieldIds,
          isLoading: false,
          usedSources,
        });
      },
      { initialProps: { currentMap: [emptyRow] } },
    );

    expect(mockSetValue).toHaveBeenCalled();
    mockSetValue.mockClear();

    rerender({ currentMap: [emptyRow] });
    expect(mockSetValue).not.toHaveBeenCalled();
  });
});
