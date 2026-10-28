import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <div className="flex justify-center items-center space-x-4 mt-8 mb-8">
      {prevPage ? (
        <Link
          href={`/?page=${prevPage}`}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-orange-500 transition-colors border border-gray-700"
        >
          &larr; Previous
        </Link>
      ) : (
        <span className="px-4 py-2 bg-gray-900 text-gray-600 rounded border border-gray-800 cursor-not-allowed">
          &larr; Previous
        </span>
      )}

      <span className="text-gray-300 font-medium">
        Page {currentPage} of {totalPages}
      </span>

      {nextPage ? (
        <Link
          href={`/?page=${nextPage}`}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-orange-500 transition-colors border border-gray-700"
        >
          Next &rarr;
        </Link>
      ) : (
        <span className="px-4 py-2 bg-gray-900 text-gray-600 rounded border border-gray-800 cursor-not-allowed">
          Next &rarr;
        </span>
      )}
    </div>
  );
}
