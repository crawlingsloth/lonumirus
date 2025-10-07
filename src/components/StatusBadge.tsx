import { getStatusBadgeClasses } from '../lib/utils';
import type { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const formatStatus = (s: OrderStatus): string => {
    return s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <span className={getStatusBadgeClasses(status)}>
      {formatStatus(status)}
    </span>
  );
}
