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
    title: "Show me ZEKO upcoming events",
    message: "Show me ZEKO upcoming events",
  },
  {
    id: generateId(),
    title: "Show me forecast for ZEKO",
    message: "Show me forecast for ZEKO",
  },
  {
    id: generateId(),
    title: "Buy ZEKO if P/E ratio is above 0",
    message: "Buy 10 ZEKO when P/E ratio is above 0",
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
];
