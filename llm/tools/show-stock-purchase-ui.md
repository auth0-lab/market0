```js
/**
 *
 * This is an example callback function that is called when the user is not authorized to buy a stock.
 *
 * We make an extra call to the AI to improve the response message.
 *
 * @param history
 * @returns
 */
const onUnauthorized = (history: ReturnType<typeof getHistory>) => {
  return async function* ({
    symbol,
    price,
    numberOfShares,
  }: ShowStockPurchaseUIToolParams): AsyncGenerator<
    ReactNode,
    ReactNode,
    unknown
  > {
    const toolCallId = generateId();
    const systemDetailedResponse = `
The user and/or account you are currently logged in with is not authorized to buy ${numberOfShares} of the stock ${symbol}.
This restriction applies only to the current account and ${symbol}.
The restriction is not related to "demo environment" OR THE "sandbox environment".
**IMPORTANT**: Each time you attempt to buy ${symbol}, we will try to call the underlying tool and determine if you have permissions.
  `;

    const { text: assistantResponse } = await generateText({
      model: openai("gpt-3.5-turbo"),
      temperature: 1,
      messages: [
        ...(history.get() as CoreMessage[]),
        {
          role: "assistant",
          content: [
            {
              type: "tool-call",
              toolName: "show_stock_purchase_ui",
              toolCallId,
              args: {
                symbol,
                numberOfShares,
                price,
              },
            },
          ],
        },
        {
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolName: "show_stock_purchase_ui",
              toolCallId,
              result: {
                error: {
                  stock: symbol,
                  is_user_authorized_to_trade_stock: false,
                  message: `User is not authorized to buy ${numberOfShares} of the stock ${symbol}.`,
                  detail: systemDetailedResponse,
                },
              },
            },
          ],
        },
      ],
    });

    const newMessages: ServerMessage[] = [
      {
        role: "system",
        content: systemDetailedResponse,
      },
      {
        role: "assistant",
        content: assistantResponse,
      },
    ];

    history.update(newMessages);

    return assistantResponse;
  };
};
```
