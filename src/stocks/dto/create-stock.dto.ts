export class CreateStockDto {
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  status?: string;
  category?: string;
}
