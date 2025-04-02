import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';

export type PlanCreatePageState = {
  nameFilter: string;
  typeFilters: string[];
  selectedProviderUID: string;
  selectedVMs: VmData[];
};

export const planCreatePageInitialState: PlanCreatePageState = {
  nameFilter: '',
  selectedProviderUID: '',
  selectedVMs: [],
  typeFilters: [],
};

const SET_NAME_FILTER = 'SET_NAME_FILTER';
const UPDATE_TYPE_FILTERS = 'UPDATE_TYPE_FILTERS';
const SELECT_PROVIDER = 'SELECT_PROVIDER';
const UPDATE_SELECTED_VMS = 'UPDATE_SELECTED_VMS';

// Refine the action type to include specific payloads
type SetNameFilterAction = {
  type: typeof SET_NAME_FILTER;
  payload: string;
};

type UpdateTypeFiltersAction = {
  type: typeof UPDATE_TYPE_FILTERS;
  payload: string[];
};

type SelectProviderAction = {
  type: typeof SELECT_PROVIDER;
  payload: string;
};

type UpdateSelectedVMsAction = {
  type: typeof UPDATE_SELECTED_VMS;
  payload: VmData[];
};

export type PlanCreatePageActionTypes =
  | SetNameFilterAction
  | UpdateTypeFiltersAction
  | SelectProviderAction
  | UpdateSelectedVMsAction;

export const planCreatePageReducer = (
  state: typeof planCreatePageInitialState,
  action: PlanCreatePageActionTypes,
): typeof planCreatePageInitialState => {
  switch (action.type) {
    case SET_NAME_FILTER:
      return { ...state, nameFilter: action.payload, selectedProviderUID: '', selectedVMs: [] };
    case UPDATE_TYPE_FILTERS:
      return { ...state, selectedProviderUID: '', selectedVMs: [], typeFilters: action.payload };
    case SELECT_PROVIDER:
      return { ...state, selectedProviderUID: action.payload, selectedVMs: [] };
    case UPDATE_SELECTED_VMS:
      return { ...state, selectedVMs: action.payload };
    default:
      return state;
  }
};
