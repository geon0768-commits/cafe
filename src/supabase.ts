import { createClient } from '@supabase/supabase-js';
import { OrderRecord } from './types.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface CafeMenuRow {
  id: number;
  customer_name: string;
  phone_number: string | null;
  beverage_name: string;
  size_option: string;
  extra_options: string[] | null;
  quantity: number;
  requests: string | null;
  total_price: number;
  created_at: string;
}

export const toOrderRecord = (row: CafeMenuRow): OrderRecord => {
  const extraOptions = row.extra_options ?? [];
  const optionsText = extraOptions.length > 0 ? ` (${extraOptions.join(', ')})` : '';
  const orderedAt = new Date(row.created_at).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    id: String(row.id),
    customerName: row.customer_name,
    phoneNumber: row.phone_number ?? '',
    beverageName: row.beverage_name,
    sizeName: `${row.size_option}사이즈`,
    extraOptionsSummary: extraOptions.length > 0 ? extraOptions.join(', ') : '없음',
    quantity: row.quantity,
    requests: row.requests ?? '',
    totalPrice: row.total_price,
    confirmationMessage: `${row.customer_name}님, ${row.beverage_name} ${row.size_option}사이즈${optionsText} ${row.quantity}잔, 총 ${row.total_price.toLocaleString()}원 주문이 접수되었습니다!`,
    orderedAt,
  };
};

export const toCafeMenuRow = (order: OrderRecord) => ({
  customer_name: order.customerName,
  phone_number: order.phoneNumber || null,
  beverage_name: order.beverageName,
  size_option: order.sizeName.replace('사이즈', ''),
  extra_options: order.extraOptionsSummary === '없음'
    ? []
    : order.extraOptionsSummary.split(', '),
  quantity: order.quantity,
  requests: order.requests || null,
  total_price: order.totalPrice,
});