/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import { 
  BEVERAGE_MENU, 
  SIZE_OPTIONS, 
  EXTRA_OPTIONS, 
  OrderFormData, 
  OrderRecord 
} from '../types.ts';
import { CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

interface OrderFormProps {
  onOrderSuccess: (newOrder: OrderRecord) => void;
}

// 폼 초기 상태 정의 (기본값 설정)
const INITIAL_FORM_STATE: OrderFormData = {
  customerName: '',          // 이름 (초기값 비어있음)
  phoneNumber: '',           // 전화번호
  beverageId: '',            // 음료 선택 (초기값 미선택)
  size: 'M',                 // 사이즈 기본 선택: M (+500원)
  extraOptionIds: [],        // 추가 옵션 초기값: 없음
  quantity: 1,               // 수량 기본값: 1 (최소 1, 최대 10)
  requests: '',              // 요청사항
};

/**
 * 바이브 카페 주문서 폼 컴포넌트
 * 요구사항에 맞춰 모든 input과 label 연결, 실시간 금액 계산, 유효성 검사 및 확인 메시지 표시
 */
export const OrderForm: React.FC<OrderFormProps> = ({ onOrderSuccess }) => {
  // 주문서 상태 관리
  const [formData, setFormData] = useState<OrderFormData>(INITIAL_FORM_STATE);

  // 주문 완료 후 표시할 메시지 상태
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  // 인라인 경고 메시지 상태 (이름 미입력 또는 음료 미선택 시)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 접근성을 위한 고유 ID 생성 (모든 input에 label 연결)
  const nameInputId = useId();
  const phoneInputId = useId();
  const beverageSelectId = useId();
  const quantityInputId = useId();
  const requestsTextareaId = useId();

  // ==========================================
  // [실시간 금액 계산 로직]
  // 음료 기본 가격 + 사이즈 추가금 + 옵션 추가금의 합계에 수량을 곱함
  // ==========================================
  const calculateTotal = (): number => {
    // 1. 선택된 음료 기본 가격 확인
    const selectedBeverage = BEVERAGE_MENU.find((item) => item.id === formData.beverageId);
    const beveragePrice = selectedBeverage ? selectedBeverage.price : 0;

    // 음료가 선택되지 않은 경우 예상 금액은 0원 (또는 음료 선택 전 기본 안내)
    if (!selectedBeverage) {
      return 0;
    }

    // 2. 사이즈 추가 요금 계산 (S: 0원, M: +500원, L: +1000원)
    const selectedSize = SIZE_OPTIONS.find((s) => s.id === formData.size);
    const sizePrice = selectedSize ? selectedSize.extraPrice : 0;

    // 3. 선택된 추가 옵션 총액 계산
    const extraPrice = formData.extraOptionIds.reduce((sum, optId) => {
      const option = EXTRA_OPTIONS.find((opt) => opt.id === optId);
      return sum + (option ? option.price : 0);
    }, 0);

    // 4. 단가 합계 * 주문 수량 계산
    const unitPrice = beveragePrice + sizePrice + extraPrice;
    return unitPrice * (formData.quantity || 1);
  };

  const estimatedTotal = calculateTotal();

  // ==========================================
  // [입력값 변경 핸들러 함수들]
  // ==========================================

  // 이름 변경 핸들러
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, customerName: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  // 전화번호 변경 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }));
  };

  // 음료 선택 핸들러
  const handleBeverageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, beverageId: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  // 사이즈 라디오 변경 핸들러
  const handleSizeChange = (newSize: 'S' | 'M' | 'L') => {
    setFormData((prev) => ({ ...prev, size: newSize }));
  };

  // 추가 옵션 체크박스 변경 핸들러
  const handleOptionToggle = (optionId: string) => {
    setFormData((prev) => {
      const exists = prev.extraOptionIds.includes(optionId);
      const updated = exists
        ? prev.extraOptionIds.filter((id) => id !== optionId)
        : [...prev.extraOptionIds, optionId];
      return { ...prev, extraOptionIds: updated };
    });
  };

  // 수량 변경 핸들러 (최소 1, 최대 10)
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      val = 1;
    } else if (val < 1) {
      val = 1;
    } else if (val > 10) {
      val = 10;
    }
    setFormData((prev) => ({ ...prev, quantity: val }));
  };

  // 요청사항 변경 핸들러
  const handleRequestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, requests: e.target.value }));
  };

  // ==========================================
  // [다시 작성 (초기화) 버튼 핸들러]
  // 모든 입력과 계산된 금액, 알림 메시지를 초기 상태로 리셋
  // ==========================================
  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setConfirmationMessage(null);
    setErrorMessage(null);
  };

  // ==========================================
  // [주문하기 버튼 제출 핸들러]
  // 유효성 검사 및 주문 확인 메시지 생성
  // ==========================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 이름이 비어있으면 "이름을 입력해주세요" 알림
    if (!formData.customerName.trim()) {
      setErrorMessage('이름을 입력해주세요');
      setConfirmationMessage(null);
      alert('이름을 입력해주세요');
      const nameInput = document.getElementById(nameInputId);
      if (nameInput) nameInput.focus();
      return;
    }

    // 2. 음료를 선택하지 않았으면 "음료를 선택해주세요" 알림
    if (!formData.beverageId) {
      setErrorMessage('음료를 선택해주세요');
      setConfirmationMessage(null);
      alert('음료를 선택해주세요');
      const selectElem = document.getElementById(beverageSelectId);
      if (selectElem) selectElem.focus();
      return;
    }

    // 3. 정상 입력 시 데이터 구성 및 주문 확인 메시지 생성
    const selectedBeverage = BEVERAGE_MENU.find((b) => b.id === formData.beverageId)!;
    const selectedOptions = formData.extraOptionIds
      .map((id) => EXTRA_OPTIONS.find((opt) => opt.id === id)?.name)
      .filter(Boolean) as string[];

    // 옵션 표시 문자열 생성 (예: "(샷 추가)" 또는 "(샷 추가, 크림 추가)" 또는 옵션 없을 시 "")
    const optionsText = selectedOptions.length > 0 ? ` (${selectedOptions.join(', ')})` : '';

    // 천 단위 콤마 포맷팅 (toLocaleString)
    const formattedPrice = estimatedTotal.toLocaleString();

    // 프롬프트 요구 포맷:
    // "홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문이 접수되었습니다!"
    const successMsg = `${formData.customerName.trim()}님, ${selectedBeverage.name} ${formData.size}사이즈${optionsText} ${formData.quantity}잔, 총 ${formattedPrice}원 주문이 접수되었습니다!`;

    setErrorMessage(null);
    setConfirmationMessage(successMsg);

    // 상위 게시판 목록에 기록 저장
    const newRecord: OrderRecord = {
      id: String(Date.now()),
      customerName: formData.customerName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      beverageName: selectedBeverage.name,
      sizeName: `${formData.size}사이즈`,
      extraOptionsSummary: selectedOptions.length > 0 ? selectedOptions.join(', ') : '없음',
      quantity: formData.quantity,
      requests: formData.requests.trim(),
      totalPrice: estimatedTotal,
      confirmationMessage: successMsg,
      orderedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    onOrderSuccess(newRecord);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#ecdcd0] p-6 md:p-8">
      {/* 주문서 폼 본문 */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        
        {/* 1. 이름 (필수, text) */}
        <div>
          <label 
            htmlFor={nameInputId} 
            className="block text-sm font-semibold text-[#4a2c18] mb-1.5"
          >
            이름 <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            id={nameInputId}
            type="text"
            value={formData.customerName}
            onChange={handleNameChange}
            placeholder="주문자 성함을 입력해주세요 (예: 홍길동)"
            className="cafe-input"
            required
            autoComplete="name"
          />
        </div>

        {/* 2. 전화번호 (tel) */}
        <div>
          <label 
            htmlFor={phoneInputId} 
            className="block text-sm font-semibold text-[#4a2c18] mb-1.5"
          >
            전화번호
          </label>
          <input
            id={phoneInputId}
            type="tel"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            placeholder="연락처를 입력해주세요 (예: 010-1234-5678)"
            className="cafe-input"
            autoComplete="tel"
          />
        </div>

        {/* 3. 음료 선택 (드롭다운) */}
        <div>
          <label 
            htmlFor={beverageSelectId} 
            className="block text-sm font-semibold text-[#4a2c18] mb-1.5"
          >
            음료 선택 <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="relative">
            <select
              id={beverageSelectId}
              value={formData.beverageId}
              onChange={handleBeverageChange}
              className="cafe-input appearance-none cursor-pointer pr-10"
              required
            >
              <option value="">-- 음료를 선택해주세요 --</option>
              {BEVERAGE_MENU.map((beverage) => (
                <option key={beverage.id} value={beverage.id}>
                  {beverage.name} ({beverage.price.toLocaleString()}원)
                </option>
              ))}
            </select>
            {/* 드롭다운 화살표 장식 */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6b4226]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. 사이즈 (라디오 버튼, 가로 배치) */}
        <div>
          <span className="block text-sm font-semibold text-[#4a2c18] mb-2">
            사이즈 선택
          </span>
          <div className="flex flex-wrap items-center gap-4">
            {SIZE_OPTIONS.map((size) => {
              const radioId = `size-option-${size.id}`;
              const isChecked = formData.size === size.id;
              return (
                <div key={size.id} className="flex items-center">
                  <input
                    id={radioId}
                    type="radio"
                    name="beverage-size"
                    value={size.id}
                    checked={isChecked}
                    onChange={() => handleSizeChange(size.id)}
                    className="w-4 h-4 text-[#6b4226] focus:ring-[#6b4226] accent-[#6b4226] cursor-pointer"
                  />
                  <label 
                    htmlFor={radioId} 
                    className="ml-2 text-sm text-[#4a2c18] cursor-pointer select-none font-medium"
                  >
                    {size.name} {size.extraPrice > 0 ? `(+${size.extraPrice.toLocaleString()}원)` : '(+0원)'}
                    {size.id === 'M' && (
                      <span className="ml-1 text-xs text-[#8c674b] bg-[#f4ebe1] px-1.5 py-0.5 rounded">
                        기본
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. 추가 옵션 (체크박스, 가로 배치) */}
        <div>
          <span className="block text-sm font-semibold text-[#4a2c18] mb-2">
            추가 옵션
          </span>
          <div className="flex flex-wrap items-center gap-4">
            {EXTRA_OPTIONS.map((option) => {
              const checkboxId = `extra-option-${option.id}`;
              const isChecked = formData.extraOptionIds.includes(option.id);
              return (
                <div key={option.id} className="flex items-center">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleOptionToggle(option.id)}
                    className="w-4 h-4 text-[#6b4226] rounded focus:ring-[#6b4226] accent-[#6b4226] cursor-pointer"
                  />
                  <label 
                    htmlFor={checkboxId} 
                    className="ml-2 text-sm text-[#4a2c18] cursor-pointer select-none"
                  >
                    {option.name} {option.price > 0 ? `(+${option.price.toLocaleString()}원)` : '(+0원)'}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. 수량 (number 타입, 최소 1, 최대 10, 기본값 1) */}
        <div>
          <label 
            htmlFor={quantityInputId} 
            className="block text-sm font-semibold text-[#4a2c18] mb-1.5"
          >
            수량 (최소 1잔 ~ 최대 10잔)
          </label>
          <div className="flex items-center gap-3">
            <input
              id={quantityInputId}
              type="number"
              min="1"
              max="10"
              value={formData.quantity}
              onChange={handleQuantityChange}
              className="cafe-input max-w-[120px] font-semibold text-center"
              required
            />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                className="w-10 h-10 flex items-center justify-center bg-[#f0e6dc] text-[#5c3a21] hover:bg-[#e5d7ca] font-bold rounded-lg transition-colors"
                aria-label="수량 감소"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, quantity: Math.min(10, prev.quantity + 1) }))}
                className="w-10 h-10 flex items-center justify-center bg-[#f0e6dc] text-[#5c3a21] hover:bg-[#e5d7ca] font-bold rounded-lg transition-colors"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>
            <span className="text-xs text-[#8c674b]">잔 단위로 주문됩니다</span>
          </div>
        </div>

        {/* 7. 요청사항 (textarea) */}
        <div>
          <label 
            htmlFor={requestsTextareaId} 
            className="block text-sm font-semibold text-[#4a2c18] mb-1.5"
          >
            요청사항
          </label>
          <textarea
            id={requestsTextareaId}
            rows={3}
            value={formData.requests}
            onChange={handleRequestsChange}
            placeholder="바리스타에게 전할 요청사항이 있다면 적어주세요 (예: 덜 달게 해주세요, 얼음 적게 등)"
            className="cafe-input resize-none"
          />
        </div>

        {/* 에러 경고 메시지 표시 */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ==================================================== */}
        {/* 예상 금액 표시 영역 */}
        {/* 큰 글씨(24px), 갈색(#6b4226), 굵게, 가운데 정렬 */}
        {/* 주문하기 버튼 바로 위에 배치 */}
        {/* ==================================================== */}
        <div className="pt-3 pb-1 border-t border-[#f0e6dc] text-center">
          <p className="text-xs text-[#8c674b] uppercase tracking-wider mb-1 font-medium">
            실시간 계산 금액
          </p>
          <div 
            className="text-[24px] font-bold text-[#6b4226] text-center py-2 px-4 rounded-xl bg-[#faf6f0] border border-[#ecdcd0]"
            aria-live="polite"
          >
            예상 금액: {estimatedTotal.toLocaleString()}원
          </div>
        </div>

        {/* 8. 주문하기 버튼 & 9. 다시 작성 버튼 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* 8. 주문하기 버튼: 갈색 배경(#6b4226), 흰색 글씨, hover시 약간 밝게 */}
          <button
            type="submit"
            className="sm:col-span-2 btn-order py-3 px-5 rounded-lg font-bold text-base shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>주문하기</span>
          </button>

          {/* 9. 다시 작성 버튼: 모든 입력과 금액 초기화 */}
          <button
            type="button"
            onClick={handleReset}
            className="btn-reset py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 작성</span>
          </button>
        </div>
      </form>

      {/* ==================================================== */}
      {/* 주문 확인 메시지 표시 영역 */}
      {/* 연두색 배경, 초록 글씨, 둥근 모서리 */}
      {/* ==================================================== */}
      {confirmationMessage && (
        <div 
          className="mt-6 p-4 bg-[#e8f5e9] text-[#1b5e20] border border-[#c8e6c9] rounded-xl flex items-start gap-3 shadow-xs animate-fadeIn"
          role="status"
        >
          <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#1b5e20]">주문이 성공적으로 접수되었습니다!</h4>
            <p className="text-sm font-medium leading-relaxed">
              {confirmationMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
