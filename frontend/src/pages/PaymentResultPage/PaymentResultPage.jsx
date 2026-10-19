import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const bookingId = searchParams.get('bookingId');
  const [copied, setCopied] = useState(false);

  const isSuccess = status === 'success';

  const handleCopyCode = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 overflow-hidden p-8 space-y-6 text-center transform transition-all duration-300">
        
        {/* Animated Icon */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isSuccess ? (
            <div className="relative transform transition-transform hover:scale-105 duration-300">
              <svg className="mx-auto h-24 w-24 text-green-500 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <div className="relative transform transition-transform hover:scale-105 duration-300">
              <svg className="mx-auto h-24 w-24 text-rose-500 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isSuccess 
              ? 'Giao dịch của bạn đã được xác nhận. Chúc bạn có một buổi xem phim tuyệt vời tại rạp!' 
              : 'Rất tiếc, đã có lỗi xảy ra hoặc bạn đã hủy giao dịch. Vui lòng thử thanh toán lại.'}
          </p>
        </div>

        {/* Booking Code Highlight Card */}
        {isSuccess && bookingId && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 block">
              Mã đặt vé / Tra cứu Combo
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-black text-emerald-800 font-mono tracking-wider">
                #{bookingId}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition text-sm font-semibold flex items-center gap-1 shadow-sm"
                title="Sao chép mã"
              >
                {copied ? '✅ Đã chép' : '📋 Chép'}
              </button>
            </div>
            <p className="text-xs text-emerald-600">
              Đọc mã này cho nhân viên tại rạp để nhận vé và bắp nước.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {isSuccess && (
            <button
              onClick={() => navigate('/my-tickets')}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-xl text-base font-bold text-white shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-500/25 transition-all duration-300"
            >
              <span>🎫 Xem vé của tôi & Combo</span>
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className={`w-full flex justify-center items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
              isSuccess
                ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                : 'text-white bg-rose-600 hover:bg-rose-700 shadow-lg hover:shadow-rose-500/25'
            }`}
          >
            <span>🏠 Về trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
