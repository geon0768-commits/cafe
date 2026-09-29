/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * 카페 상단 헤더 컴포넌트
 * - 카페 로고: ☕ 이모지 크게
 * - 카페 이름: "바이브 카페"
 * - 부제: "당신의 하루에 바이브를 더하다"
 */
export const CafeHeader: React.FC = () => {
  return (
    <header className="text-center pt-6 pb-4">
      {/* 1. 카페 로고: ☕ 이모지 크게 */}
      <div 
        className="inline-flex items-center justify-center w-20 h-20 bg-[#efe5da] text-5xl rounded-full shadow-sm mb-3 transform hover:scale-105 transition-transform duration-200 select-none"
        aria-label="바이브 카페 커피 로고"
      >
        ☕
      </div>

      {/* 2. 카페 이름: 바이브 카페 */}
      <h1 className="text-3xl font-bold tracking-tight text-[#4a2c18] mb-1">
        바이브 카페
      </h1>

      {/* 3. 부제: 당신의 하루에 바이브를 더하다 */}
      <p className="text-sm md:text-base text-[#7d5d42] font-medium">
        당신의 하루에 바이브를 더하다
      </p>

      {/* 따뜻한 분위기의 안내 띠 */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8c674b] bg-[#f4ebe1] py-1 px-3 rounded-full inline-flex mx-auto border border-[#e6d7c8]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>신선한 원두와 정성으로 준비합니다</span>
      </div>
    </header>
  );
};
