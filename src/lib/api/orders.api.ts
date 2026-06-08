import { apiClient } from './client';
import type { ApiEnvelope } from '@/types/api.types';
import type { Order, PlaceOrderRequest } from '@/types/order.types';

export const ordersApi = {
  buy: (body: PlaceOrderRequest) =>
    apiClient.post<ApiEnvelope<Order>>('/orders/buy', body).then((r) => r.data),

  sell: (body: PlaceOrderRequest) =>
    apiClient.post<ApiEnvelope<Order>>('/orders/sell', body).then((r) => r.data),

  cancel: (orderId: string | number) =>
    apiClient.delete<ApiEnvelope<Order>>(`/orders/${orderId}/cancel`).then((r) => r.data),

  history: () =>
    apiClient.get<ApiEnvelope<Order[]>>('/orders').then((r) => r.data),

  pending: () =>
    apiClient.get<ApiEnvelope<Order[]>>('/orders/pending').then((r) => r.data),
};