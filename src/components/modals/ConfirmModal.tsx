import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  details: { label: string; value: string }[];
  listItems: string[];
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  details,
  listItems,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-[4px]"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-[340px] bg-[#1e293b] rounded-[20px] p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="text-lg font-bold text-white mb-3">{title}</div>
            
            <div className="border-b border-white/10 mb-4 pb-1">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between text-sm text-text-sub mb-2">
                  <span>{detail.label}:</span>
                  <span className="font-semibold text-[#e2e8f0] text-right max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>

            {listItems.length > 0 && (
              <>
                <div className="text-[0.85rem] font-semibold text-[#cbd5e1] mb-1">
                  Danh sách chọn:
                </div>
                <div className="mt-1 max-h-[150px] overflow-y-auto bg-black/20 rounded-lg p-2 border border-white/5">
                  {listItems.map((item, index) => (
                    <div
                      key={index}
                      className="text-[0.85rem] text-[#ccc] py-1 border-b border-white/5 last:border-none whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="text-[0.8rem] text-[#94a3b8] leading-tight mt-4">
              Yêu cầu sẽ được gửi 1 lần duy nhất vào hàng đợi xử lý nền.
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 bg-transparent text-text-main border border-[#2e3a52] py-4 rounded-xl text-base font-bold active:bg-white/5 transition-colors"
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-accent text-white border-none py-4 rounded-xl text-base font-bold shadow-[0_4px_15px_var(--accent-glow)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
                disabled={isLoading}
              >
                {isLoading ? 'Đang gửi...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
