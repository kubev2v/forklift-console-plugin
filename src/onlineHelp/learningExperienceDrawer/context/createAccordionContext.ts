import type { AccordionContextType } from '../utils/types';

export const createAccordionContext = (): AccordionContextType => ({
  closeExpansionItem: () => null,
  openExpansionItem: () => null,
  openExpansionItems: [],
});
