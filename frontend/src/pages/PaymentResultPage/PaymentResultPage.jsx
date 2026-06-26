import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 overflow-hidden p-10 space-y-8 text-center transform transition-all hover:scale-[1.02] duration-300">
        
        {/* Animated Icon */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isSuccess ? (
            <div className="relative transform transition-transform hover:rotate-12 duration-300">
              <svg className="mx-auto h-28 w-28 text-green-500 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <div className="relative transform transition-transform hover:rotate-12 duration-300">
              <svg className="mx-auto h-28 w-28 text-rose-500 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Text Content */}
        <div className="space-y-3">
          <h2 className={`text-4xl font-extrabold tracking-tight ${isSuccess ? 'text-gray-900' : 'text-gray-900'}`}>
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h2>
          <p className="text-base text-gray-500 leading-relaxed font-medium">
            {isSuccess 
              ? 'Tuyệt vời! Giao dịch của bạn đã được xác nhận. Chúc bạn có một buổi xem phim thật vui vẻ.' 
              : 'Rất tiếc, đã có lỗi xảy ra hoặc bạn đã hủy giao dịch. Vui lòng thử thanh toán lại.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={() => navigate('/')}
            className={`w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl text-base font-bold text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
              isSuccess 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/30 focus:ring-green-400' 
                : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 hover:shadow-rose-500/30 focus:ring-rose-400'
            }`}
          >
            <span>Về trang chủ</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
