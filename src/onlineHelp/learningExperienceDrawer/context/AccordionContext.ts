import { createContext } from 'react';

import type { AccordionContextType } from '../utils/types';

import { createAccordionContext } from './createAccordionContext';

export const AccordionContext = createContext<AccordionContextType>(createAccordionContext());
