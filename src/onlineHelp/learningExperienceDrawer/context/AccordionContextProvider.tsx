import type { FC, ReactNode } from 'react';

import { AccordionContext } from './AccordionContext';
import { useAccordionContext } from './useAccordionContext';

type AccordionContextProviderProps = {
  children: ReactNode;
};

const AccordionContextProvider: FC<AccordionContextProviderProps> = ({ children }) => {
  const value = useAccordionContext();

  return <AccordionContext.Provider value={value}>{children}</AccordionContext.Provider>;
};

export default AccordionContextProvider;
