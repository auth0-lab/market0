import { generateId } from "ai";

import {
  CartIcon,
  EarningsIcon,
  PurchaseStockIcon,
  ReminderIcon,
  ShowEventsIcon,
  StockPriceIcon,
  TrendingStocksIcon,
} from "@/components/icons";

export const examples = [
  {
    id: generateId(),
    title: "Show ZEKO’s stock price",
    message: "Show the stock price of ZEKO",
  },
  {
    id: generateId(),
    title: "Buy 10 shares of ZEKO",
    message: "I'd like to buy 10 shares of ZEKO",
  },
  {
    id: generateId(),
    title: "Show me forecast for ZEKO",
    message: "Show me forecast for ZEKO",
  },
];

export const menuItems = [
  {
    id: generateId(),
    message: "What's the stock price of ZEKO?",
    icon: <StockPriceIcon />,
  },
  {
    id: generateId(),
    message: "Show me earnings for ZEKO",
    icon: <EarningsIcon />,
  },
  {
    id: generateId(),
    message: "Show me forecast for ZEKO",
    icon: <TrendingStocksIcon />,
  },
  {
    id: generateId(),
    message: "Show me ZEKO upcoming events",
    icon: <ShowEventsIcon />,
  },
  {
    id: generateId(),
    message: "Buy 10 shares of ZEKO",
    icon: <PurchaseStockIcon />,
  },
  {
    id: generateId(),
    message: "Buy 10 ZEKO when P/E ratio is above 0",
    icon: <CartIcon />,
  },
  {
    id: generateId(),
    message: "Remind me to buy ZEKO in two weeks",
    icon: <ReminderIcon />,
  },
];
