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
    <div className="p-6 bg-white border-black border-2 m-2 shadow-md rounded-lg relative">
      <table className="min-w-full border rounded overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 border-b text-left flex items-center gap-2">
              <input
                type="checkbox"
                className="big-checkbox"
                checked={
                  artworks.length > 0 &&
                  artworks.every((a) => selectedIds.includes(a.id))
                }
                onChange={toggleSelectAll}
              />
              <button
                onClick={() => setShowDropdown((p) => !p)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronDown size={18} />
              </button>
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
              className={`hover:bg-blue-50 ${
                selectedIds.includes(art.id) ? "bg-blue-100" : ""
              }`}
            >
              <td className="p-3 border-b">
                <input
                  type="checkbox"
                  className="big-checkbox"
                  checked={selectedIds.includes(art.id)}
                  onChange={() => toggleSelect(art.id)}
                />
              </td>
              <td className="p-3 border-b">{art.id}</td>
              <td className="p-3 border-b">{art.title}</td>
              <td className="p-3 border-b">{art.artist_display || "N/A"}</td>
              <td className="p-3 border-b">
                {art.place_of_origin || "Unknown"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showDropdown && (
        <div className="absolute left-12 top-12 bg-white shadow-lg border rounded p-4 w-64 animate-slide-down">
          <input
            type="number"
            value={selectCount}
            onChange={(e) => setSelectCount(Number(e.target.value))}
            placeholder="Enter number"
            className="w-full border rounded px-2 py-1 mb-2"
          />
          <button
            onClick={handleCheckThis}
            className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
          >
            Check this
          </button>
        </div>
      )}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center flex-col gap-4 space-x-6">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className={`px-3 py-1 rounded-full border text-sm flex items-center justify-center ${
                page === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-full border text-sm flex items-center justify-center ${
                page === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  p === page
                    ? "bg-blue-500 text-white"
                    : "hover:bg-blue-100 text-gray-700"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-full border text-sm flex items-center justify-center ${
                page === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-full border text-sm flex items-center justify-center ${
                page === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="rows" className="text-sm text-gray-600">
              Rows per page:
            </label>
            <select
              id="rows"
              className="border rounded px-3 py-1 text-sm"
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
    </div>
  );
}
