import { createContext, ReactNode, useContext, useState } from "react";

export enum ExplanationType {
  StocksUpcomingEvents = "stocks-upcoming-events",
  StockConditionalPurchase = "stock-conditional-purchase",
  Documents = "documents",
}

export type ExplanationMeta = { type: ExplanationType; expand?: boolean } | null;

interface ObservableContextType {
  explanation: ExplanationMeta;
  setExplanation: React.Dispatch<React.SetStateAction<ExplanationMeta>>;
}

const ObservableContext = createContext<ObservableContextType | undefined>(undefined);

export const ObservableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [explanation, setExplanation] = useState<ExplanationMeta>(null);

  return <ObservableContext.Provider value={{ explanation, setExplanation }}>{children}</ObservableContext.Provider>;
};

export const useObservable = () => {
  const context = useContext(ObservableContext);
  if (!context) {
    throw new Error("useObservable must be used within an ObservableProvider");
  }
  return context;
};
