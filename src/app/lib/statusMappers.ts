// Shared status label mappers used across dashboard pages.
// Each function maps a raw DB status string to a human-readable label.

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function mapAppointmentStatus(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    failed: 'Failed',
  };
  return map[status] ?? capitalize(status);
}

export function mapWalkInStatus(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    completed: 'Completed',
  };
  return map[status] ?? capitalize(status);
}

export function mapOrderStatus(status: string): string {
  const map: Record<string, string> = {
    pending: 'Processing',
    paid: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return map[status] ?? capitalize(status);
}

// Returns Tailwind class strings for status badge styling
export function appointmentStatusClasses(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function orderStatusClasses(status: string): string {
  const mapped = mapOrderStatus(status);
  const map: Record<string, string> = {
    Processing: 'bg-yellow-100 text-yellow-700',
    Shipped: 'bg-blue-100 text-blue-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return map[mapped] ?? 'bg-gray-100 text-gray-600';
}
