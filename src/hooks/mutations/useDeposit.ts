import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/lib/api/wallet.api';
import { walletKeys } from '@/hooks/queries/useWallet';

export function useDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => walletApi.deposit(amount).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}