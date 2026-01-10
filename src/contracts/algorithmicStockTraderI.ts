export function algorithmicStockTraderI(data: number[]): number {
  let maxProfit = 0;
  for (let i = 0; i < data.length; i++) {
    const stockPrice = data[i];

    for (let j = i; j < data.length; j++) {
      const futureStockPrice = data[j];
      const profit = futureStockPrice - stockPrice;
      maxProfit = Math.max(maxProfit, profit);
    }
  }

  return maxProfit;
}
