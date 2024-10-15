import { Events } from "./events";
import { Documents } from "./forecasts/documents";
import { FormattedText } from "./FormattedText";
import { SimpleMessage } from "./simple-message";
import { ConditionalPurchase, Positions, Stock, StockPurchase, Stocks } from "./stocks";

export const components = {
  Documents,
  Events,
  Positions,
  Stock,
  Stocks,
  SimpleMessage,
  StockPurchase,
  ConditionalPurchase,
  FormattedText,
};

type ComponentsNames = keyof typeof components;
type ComponentClasses = (typeof components)[ComponentsNames];

export const names = new Map<ComponentClasses, ComponentsNames>(
  Object.entries(components).map(([name, component]) => [component, name as ComponentsNames])
);
