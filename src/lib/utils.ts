import type { OrderStatus } from '../types';

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatCurrency(amount: number): string {
  return `MVR ${amount.toFixed(2)}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    submitted: 'gray',
    payment_confirmed: 'blue',
    preparing: 'orange',
    delivered: 'green',
    cancelled: 'red',
  };
  return colors[status] || 'gray';
}

export function getStatusBadgeClasses(status: OrderStatus): string {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold';
  const colorClasses: Record<OrderStatus, string> = {
    submitted: 'bg-gray-200 text-gray-800',
    payment_confirmed: 'bg-blue-200 text-blue-800',
    preparing: 'bg-orange-200 text-orange-800',
    delivered: 'bg-green-200 text-green-800',
    cancelled: 'bg-red-200 text-red-800',
  };
  return `${baseClasses} ${colorClasses[status]}`;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Simple markdown renderer (converts to HTML)
export function renderMarkdown(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/^(.+)$/gm, '<p class="mb-2">$1</p>');
}
