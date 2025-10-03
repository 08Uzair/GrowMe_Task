import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage.ts";

interface Artwork {
  id: number;
  title: string;
  artist_display: string;
  place_of_origin: string;
}

export default function ArtworksTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<number>(5);

  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectCount, setSelectCount] = useState<number>(0);

  const [selectedIds, setSelectedIds] = useLocalStorage<number[]>(
    "selectedArtworks",
    []
  );

  const fetchData = async (page: number, limit: number) => {
    try {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`
      );
      const data = await res.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (err) {
      console.error("Error fetching artworks:", err);
    }
  };

  useEffect(() => {
    fetchData(page, rows);
  }, [page, rows]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (artworks.every((a) => selectedIds.includes(a.id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(artworks.map((a) => a.id));
    }
  };

  const handleCheckThis = async () => {
    let needed = selectCount;
    let newSelected: number[] = [];
    let currentPage = 1;

    while (needed > 0 && currentPage <= Math.ceil(totalRecords / rows)) {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${rows}`
      );
      const data = await res.json();

      const ids = data.data.map((a: Artwork) => a.id);

      for (let id of ids) {
        if (needed > 0) {
          newSelected.push(id);
          needed--;
        }
      }

      currentPage++;
    }

    setSelectedIds(newSelected);
    setShowDropdown(false);
  };

  const totalPages = Math.ceil(totalRecords / rows);

  const getPageNumbers = () => {
    const visiblePages = 6;
    const pages = [];

    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - Math.floor(visiblePages / 2));
      let end = start + visiblePages - 1;

      if (end > totalPages) {
        end = totalPages;
        start = end - visiblePages + 1;
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-2xl border border-gray-200 m-4 relative">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="p-3 border-b text-left">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                    checked={
                      artworks.length > 0 &&
                      artworks.every((a) => selectedIds.includes(a.id))
                    }
                    onChange={toggleSelectAll}
                  />
                  <button
                    onClick={() => setShowDropdown((p) => !p)}
                    className="p-1 hover:bg-gray-200 rounded transition"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </th>
              <th className="p-3 border-b text-left">ID</th>
              <th className="p-3 border-b text-left">Title</th>
              <th className="p-3 border-b text-left">Artist</th>
              <th className="p-3 border-b text-left">Origin</th>
            </tr>
          </thead>
          <tbody>
            {artworks.map((art) => (
              <tr
                key={art.id}
                className={`transition-colors duration-200 ${
                  selectedIds.includes(art.id)
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="p-3 border-b">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                    checked={selectedIds.includes(art.id)}
                    onChange={() => toggleSelect(art.id)}
                  />
                </td>
                <td className="p-3 border-b text-gray-800">{art.id}</td>
                <td className="p-3 border-b text-gray-800">{art.title}</td>
                <td className="p-3 border-b text-gray-600">
                  {art.artist_display || "N/A"}
                </td>
                <td className="p-3 border-b text-gray-600">
                  {art.place_of_origin || "Unknown"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-14 top-14 bg-white shadow-lg border rounded-lg p-4 w-64 animate-fade-in">
          <input
            type="number"
            value={selectCount}
            onChange={(e) => setSelectCount(Number(e.target.value))}
            placeholder="Enter number"
            className="w-full border rounded px-3 py-2 mb-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleCheckThis}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Select Items
          </button>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
              page === 1
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
              page === 1
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded-lg border text-sm transition ${
                p === page
                  ? "bg-blue-500 text-white border-blue-500"
                  : "hover:bg-blue-50 text-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
              page === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className={`p-2 rounded-lg border text-sm flex items-center justify-center ${
              page === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <label htmlFor="rows">Rows per page:</label>
          <select
            id="rows"
            className="border rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={rows}
            onChange={(e) => {
              setRows(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 25].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
