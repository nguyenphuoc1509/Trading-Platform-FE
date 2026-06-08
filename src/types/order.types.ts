export type OrderMode = 'MARKET' | 'LIMIT';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED';

export interface Order {
  orderId: string;
  symbol: string;
  coinName: string;
  coinImage: string;
  quantity: string;
  price: string;
  executedPrice: string | null;
  totalValue: string;
  side: OrderSide;
  orderType: OrderMode;
  status: OrderStatus;
  createdAt: number;
  executedAt: number | null;
}

export interface PlaceOrderRequest {
  coinId: string;
  quantity: number;
  mode: OrderMode;
  limitPrice?: number;
}