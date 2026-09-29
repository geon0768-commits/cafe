/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CafeHeader } from './components/CafeHeader.tsx';
import { OrderForm } from './components/OrderForm.tsx';
import { OrderBoard } from './components/OrderBoard.tsx';
import { OrderRecord } from './types.ts';
import { CafeMenuRow, supabase, toCafeMenuRow, toOrderRecord } from './supabase.ts';

// 로컬스토리지 저장 키
const STORAGE_KEY = 'vibe_cafe_orders';

// 초기 샘플 주문 데이터 (프롬프트의 테스트 및 예시 시나리오 반영)
const INITIAL_SAMPLE_ORDERS: OrderRecord[] = [
  {
    id: 'sample-1',
    customerName: '홍길동',
    phoneNumber: '010-1234-5678',
    beverageName: '카페라떼',
    sizeName: 'M사이즈',
    extraOptionsSummary: '샷 추가',
    quantity: 1,
    requests: '우유 따뜻하게 부탁드립니다.',
    totalPrice: 5000,
    confirmationMessage: '홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문이 접수되었습니다!',
    orderedAt: '12:30:00',
  }
];

/**
 * 바이브 카페 메인 애플리케이션
 * - 최대 너비 520px 가운데 정렬
 * - 베이지 (#faf6f0) 및 브라운 (#6b4226) 테마
 * - 실시간 금액 계산, 주문 접수 게시판, Supabase SQL 쿼리 제공
 */
export default function App() {
  const [orders, setOrders] = useState<OrderRecord[]>(supabase ? [] : INITIAL_SAMPLE_ORDERS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Supabase 설정이 없을 때만 기존 localStorage 저장을 사용합니다.
  useEffect(() => {
    if (supabase) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOrders(JSON.parse(saved) as OrderRecord[]);
    } catch {
      setStorageError('로컬 주문 내역을 불러오지 못했습니다.');
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let active = true;
    const loadOrders = async () => {
      const { data, error } = await client
        .from('cafe_menu')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (active) setOrders((data as CafeMenuRow[]).map(toOrderRecord));
    };

    void loadOrders().catch((error: unknown) => {
      if (active) setStorageError(`Supabase 주문 조회 실패: ${String(error)}`);
    });

    const channel = client
      .channel('cafe-menu-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cafe_menu',
      }, () => {
        void loadOrders().catch((error: unknown) => {
          if (active) setStorageError(`실시간 주문 갱신 실패: ${String(error)}`);
        });
      })
      .subscribe();

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (supabase || !isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      setStorageError('로컬 주문 내역을 저장하지 못했습니다.');
    }
  }, [orders, isLoaded]);

  // 새로운 주문 접수 처리 핸들러
  const handleOrderSuccess = async (newOrder: OrderRecord) => {
    if (!supabase) {
      setOrders((prev) => [newOrder, ...prev]);
      return;
    }

    const { data, error } = await supabase
      .from('cafe_menu')
      .insert(toCafeMenuRow(newOrder))
      .select('*')
      .single();

    if (error) {
      setStorageError(`주문 저장 실패: ${error.message}`);
      return;
    }

    const savedOrder = toOrderRecord(data as CafeMenuRow);
    setOrders((prev) => [savedOrder, ...prev.filter((order) => order.id !== savedOrder.id)]);
    setStorageError(null);
  };

  // 주문 내역 전체 초기화
  const handleClearOrders = async () => {
    if (window.confirm('주문 접수 내역을 모두 비우시겠습니까?')) {
      if (supabase) {
        const { error } = await supabase.from('cafe_menu').delete().gte('id', 1);
        if (error) {
          setStorageError(`주문 내역 삭제 실패: ${error.message}`);
          return;
        }
      }
      setOrders([]);
      setStorageError(null);
    }
  };

  return (
    // 전체 컨테이너: 최대 너비 520px, 가운데 정렬, 베이지 배경
    <div className="min-h-screen bg-[#faf6f0] px-4 py-8 flex flex-col items-center">
      {/* 520px 최대 너비 래퍼 */}
      <main className="w-full max-w-[520px] mx-auto space-y-6">
        
        {/* 1. 페이지 상단 카페 헤더 (로고, 상호, 부제) */}
        <CafeHeader />

        {storageError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {storageError}
          </p>
        )}

        {/* 2. 바이브 카페 주문서 폼 */}
        <OrderForm onOrderSuccess={handleOrderSuccess} />

        {/* 3. 접수된 주문 게시판 (실시간 피드) */}
        <OrderBoard orders={orders} onClearOrders={handleClearOrders} />

        {/* 푸터 영역 */}
        <footer className="text-center text-xs text-[#a08269] pt-4 pb-8 space-y-1">
          <p>© 2026 바이브 카페 (Vibe Cafe). All rights reserved.</p>
          <p>따뜻한 커피와 편안한 공간을 선물합니다.</p>
        </footer>
      </main>
    </div>
  );
}
