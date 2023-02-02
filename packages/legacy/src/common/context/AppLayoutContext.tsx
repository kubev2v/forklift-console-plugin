import * as React from 'react';

interface IAppLayoutContext {
  isMobileView: boolean;
  setIsMobileView: (value: boolean) => void;
}

const AppLayoutContext = React.createContext<IAppLayoutContext>({
  isMobileView: true,
  setIsMobileView: () => undefined,
});

interface IAppLayoutContextProviderProps {
  children: React.ReactNode;
}

export const AppLayoutContextProvider: React.FunctionComponent<IAppLayoutContextProviderProps> = ({
  children,
}: IAppLayoutContextProviderProps) => {
  const [isMobileView, setIsMobileView] = React.useState(true);

  return (
    <AppLayoutContext.Provider
      value={{
        isMobileView,
        setIsMobileView,
      }}
    >
      {children}
    </AppLayoutContext.Provider>
  );
};

export const useAppLayoutContext = (): IAppLayoutContext => React.useContext(AppLayoutContext);
