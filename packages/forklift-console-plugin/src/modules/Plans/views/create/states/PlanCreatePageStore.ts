import { VmData } from 'src/modules/Providers/views';

export interface PlanCreatePageState {
  nameFilter: string;
  typeFilters: string[];
  selectedProviderUID: string;
  selectedVMs: VmData[];
}

export const planCreatePageInitialState: PlanCreatePageState = {
  nameFilter: '',
  typeFilters: [],
  selectedProviderUID: '',
  selectedVMs: [],
};

export const SET_NAME_FILTER = 'SET_NAME_FILTER';
export const UPDATE_TYPE_FILTERS = 'UPDATE_TYPE_FILTERS';
export const SELECT_PROVIDER = 'SELECT_PROVIDER';
export const UPDATE_SELECTED_VMS = 'UPDATE_SELECTED_VMS';

// Refine the action type to include specific payloads
interface SetNameFilterAction {
  type: typeof SET_NAME_FILTER;
  payload: string;
}

interface UpdateTypeFiltersAction {
  type: typeof UPDATE_TYPE_FILTERS;
  payload: string[];
}

interface SelectProviderAction {
  type: typeof SELECT_PROVIDER;
  payload: string;
}

interface UpdateSelectedVMsAction {
  type: typeof UPDATE_SELECTED_VMS;
  payload: VmData[];
}

type PlanCreatePageActionTypes =
  | SetNameFilterAction
  | UpdateTypeFiltersAction
  | SelectProviderAction
  | UpdateSelectedVMsAction;

export function planCreatePageReducer(
  state: typeof planCreatePageInitialState,
  action: PlanCreatePageActionTypes,
): typeof planCreatePageInitialState {
  switch (action.type) {
    case SET_NAME_FILTER:
      return { ...state, nameFilter: action.payload };
    case UPDATE_TYPE_FILTERS:
      return { ...state, typeFilters: action.payload };
    case SELECT_PROVIDER:
      return { ...state, selectedProviderUID: action.payload, selectedVMs: [] };
    case UPDATE_SELECTED_VMS:
      return { ...state, selectedVMs: action.payload };
    default:
      return state;
  }
}
