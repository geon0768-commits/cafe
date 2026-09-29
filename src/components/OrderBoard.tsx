/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OrderRecord } from '../types.ts';
import { ClipboardList, Trash2, Clock, Coffee } from 'lucide-react';

interface OrderBoardProps {
  orders: OrderRecord[];
  onClearOrders: () => void;
}

/**
 * 카페 주문 게시판 컴포넌트
 * - 접수된 주문 내역들을 실시간 피드 형태로 표시
 * - 게시판 형태의 목록 제공
 */
export const OrderBoard: React.FC<OrderBoardProps> = ({ orders, onClearOrders }) => {
  return (
    <div className="mt-8 bg-white rounded-2xl shadow-md border border-[#ecdcd0] p-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#f0e6dc] mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#6b4226]" />
          <h2 className="text-base font-bold text-[#4a2c18]">
            실시간 주문 접수 게시판
          </h2>
          <span className="text-xs bg-[#6b4226] text-white px-2 py-0.5 rounded-full font-semibold">
            {orders.length}건
          </span>
        </div>

        {orders.length > 0 && (
          <button
            type="button"
            onClick={onClearOrders}
            className="text-xs text-[#a3795b] hover:text-red-600 flex items-center gap-1 transition-colors"
            title="주문 내역 비우기"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>내역 비우기</span>
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="py-8 text-center text-[#9c785d]">
          <Coffee className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#6b4226]" />
          <p className="text-sm font-medium">아직 접수된 주문이 없습니다.</p>
          <p className="text-xs text-[#b89f8c] mt-0.5">상단 주문서에서 음료를 주문해보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => (
            <div
              key={order.id}
              className="p-3.5 rounded-xl bg-[#faf6f0] border border-[#eee2d6] hover:border-[#d9c4b2] transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#4a2c18]">
                    {order.customerName} 고객님
                  </span>
                  <span className="text-xs bg-[#eadecc] text-[#5c3a21] px-1.5 py-0.5 rounded font-medium">
                    {order.sizeName}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#9c785d]">
                  <Clock className="w-3 h-3" />
                  <span>{order.orderedAt}</span>
                </div>
              </div>

              <div className="text-sm text-[#3b2211] font-medium flex items-center justify-between">
                <span>
                  ☕ {order.beverageName} × {order.quantity}잔
                  {order.extraOptionsSummary !== '없음' && (
                    <span className="text-xs text-[#7e5c42] ml-1">
                      ({order.extraOptionsSummary})
                    </span>
                  )}
                </span>
                <span className="text-[#6b4226] font-bold text-sm">
                  {order.totalPrice.toLocaleString()}원
                </span>
              </div>

              {order.requests && (
                <div className="mt-2 text-xs bg-white/70 p-2 rounded border border-[#eddcd0] text-[#634937]">
                  <strong>요청:</strong> {order.requests}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
