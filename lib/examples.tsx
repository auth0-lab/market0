import { generateId } from "ai";

import {
  CartIcon,
  EarningsIcon,
  PositionsIcon,
  PurchaseStockIcon,
  ReminderIcon,
  ShowEventsIcon,
  StockPriceIcon,
  TrendingStocksIcon,
} from "@/components/icons";

export const examples = [
  {
    id: generateId(),
    title: "ATKO price",
    message: "Show the stock price of NVDA",
  },
  {
    id: generateId(),
    title: "Buy 10 shares of ATKO",
    message: "I'd like to buy 10 shares of NVDA",
  },
  {
    id: generateId(),
    title: "Show me forecast for NVDIA",
    message: "Show me forecast for NVDIA",
  },
];

export const menuItems = [
  {
    id: generateId(),
    message: "What's the stock price of NVDA?",
    icon: <StockPriceIcon />,
  },
  {
    id: generateId(),
    message: "Show me earnings for NVDA",
    icon: <EarningsIcon />,
  },
  {
    id: generateId(),
    message: "Show me forecast for NVDIA",
    icon: <TrendingStocksIcon />,
  },
  {
    id: generateId(),
    message: "Show NVDA's key events for this year",
    icon: <ShowEventsIcon />,
  },
  {
    id: generateId(),
    message: "Buy 10 shares of NVDA",
    icon: <PurchaseStockIcon />,
  },
  {
    id: generateId(),
    message: "Buy 10 NVDA when P/E ratio is above 0",
    icon: <CartIcon />,
  },
  {
    id: generateId(),
    message: "Remind me to buy NVDA in two weeks",
    icon: <ReminderIcon />,
  },
];