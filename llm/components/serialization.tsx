import { ConditionalPurchase } from "./conditional-purchase";
import { Documents } from "./documents";
import { Events } from "./events";
import { FormattedText } from "./FormattedText";
import { Positions } from "./positions";
import { PurchaseConfirmation } from "./purchase-confirmation";
import { Reminder } from "./reminder";
import { SimpleMessage } from "./simple-message";
import { Stock } from "./stock";
import { StockPurchase } from "./stock-purchase";
import { Stocks } from "./stocks";

export const components = {
  Documents,
  Events,
  Positions,
  PurchaseConfirmation,
  Stock,
  Stocks,
  SimpleMessage,
  StockPurchase,
  Reminder,
  ConditionalPurchase,
  FormattedText,
};

type ComponentsNames = keyof typeof components;
type ComponentClasses = (typeof components)[ComponentsNames];

export const names = new Map<ComponentClasses, ComponentsNames>(
  Object.entries(components).map(([name, component]) => [
    component,
    name as ComponentsNames,
  ])
);
