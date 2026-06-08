import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/lib/api/wallet.api';
import { walletKeys } from '@/hooks/queries/useWallet';

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => walletApi.withdraw(amount).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}