interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2.5 my-5">
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="w-9 h-9 rounded-lg bg-[#1e293b] text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          ←
        </button>
      )}
      <div className="px-2.5 leading-9 text-[#888] text-sm">
        Trang {currentPage}/{totalPages}
      </div>
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="w-9 h-9 rounded-lg bg-[#1e293b] text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          →
        </button>
      )}
    </div>
  );
}
