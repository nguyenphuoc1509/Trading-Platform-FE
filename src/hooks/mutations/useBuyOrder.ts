// useBuyOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders.api';
import { orderKeys } from '@/hooks/queries/useOrders';
import { walletKeys } from '@/hooks/queries/useWallet';
import { portfolioKeys } from '@/hooks/queries/usePortfolio';
import type { PlaceOrderRequest } from '@/types/order.types';

export function useBuyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlaceOrderRequest) => ordersApi.buy(body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      qc.invalidateQueries({ queryKey: walletKeys.all });
      qc.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}