import { useState, useEffect } from "react";
import { offsetDays } from "../utils/helpers";

/* Borrar después */
const DEMO_BOOKS = [
  {
    id: "3",
    title: "The Song of Achilles",
    author: "Madeline Miller",
    status: "reading",
    color: "#90CAF9",
    accent: "#0D47A1",
    currentPage: 195,
    totalPages: 300,
    progressPercent: 65,
  },
  {
    id: "1",
    title: "Ariadne",
    author: "Jennifer Saint",
    status: "read",
    color: "#D8B98B",
    accent: "#7A5F3E",
    review: {
      rating: 4,
      notes:
        "Me encantó el mito retomado desde la perspectiva de Ariadne. La narrativa es envolvente y emotiva.",
    },
    finishedAt: offsetDays(-5),
  },
  {
    id: "4",
    title: "Babel",
    author: "R.F. Kuang",
    status: "read",
    color: "#4B3F2F",
    accent: "#D1B000",
    review: {
      rating: 5,
      notes:
        "Una obra maestra. El mundo académico mezclado con magia y colonialismo está brillantemente ejecutado.",
    },
    finishedAt: offsetDays(-9),
  },
  {
    id: "6",
    title: "Circe",
    author: "Madeline Miller",
    status: "read",
    color: "#FEC5BB",
    accent: "#7C2D12",
    review: {
      rating: 5,
      notes: "Poético y profundo. Los pasajes en la isla son hermosos.",
    },
    finishedAt: offsetDays(-30),
  },
  {
    id: "9",
    title: "Catching Fire",
    author: "Suzanne Collins",
    status: "read",
    color: "#C3E0E5",
    accent: "#2563EB",
    review: {
      rating: 4,
      notes: "Mejor que el primero. La arena fue increíble.",
    },
    finishedAt: offsetDays(-42),
  },
  {
    id: "10",
    title: "The Invisible Life of Addie LaRue",
    author: "V.E. Schwab",
    status: "read",
    color: "#CABFAB",
    accent: "#8B5E34",
    review: {
      rating: 3,
      notes: "Interesante concepto pero se hace un poco lento en partes.",
    },
    finishedAt: offsetDays(-63),
  },
  {
    id: "11",
    title: "City of Bones",
    author: "Cassandra Clare",
    status: "read",
    color: "#BFD8B8",
    accent: "#15803D",
    review: { rating: 3, notes: "Entretenido pero predecible." },
    finishedAt: offsetDays(-65),
  },
  {
    id: "2",
    title: "Good Girl Complex",
    author: "Elle Kennedy",
    status: "to-read",
    color: "#B7E4C7",
    accent: "#2D6A4F",
  },
  {
    id: "5",
    title: "Yellowface",
    author: "R.F. Kuang",
    status: "to-read",
    color: "#F6D365",
    accent: "#6B7280",
  },
  {
    id: "8",
    title: "Project Hail Mary",
    author: "Andy Weir",
    status: "to-read",
    color: "#2F3342",
    accent: "#FBBF24",
  },
];

export function useBooks() {
  const [books, setBooks] = useState(DEMO_BOOKS);
  const [open, setOpen] = useState(null); // libro abierto en modal
  const [page, setPage] = useState("home");

  // (Opcional) persistencia local
  useEffect(() => {
    try {
      localStorage.setItem("books-demo", JSON.stringify(books));
    } catch {}
  }, [books]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("books-demo");
      if (raw) setBooks(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddReading(b) {
    setBooks((prev) => [b, ...prev]);
    setPage("home");
  }

  function handleUpdateProgress(id, currentPage) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              currentPage,
              progressPercent: b.totalPages
                ? Math.min(100, Math.round((currentPage / b.totalPages) * 100))
                : b.progressPercent,
              ...(b.totalPages && currentPage >= b.totalPages
                ? { status: "read", finishedAt: new Date().toISOString() }
                : {}),
            }
          : b
      )
    );
  }

  function handleAddReview(id, review) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              review,
              status: "read",
              finishedAt: b.finishedAt ?? new Date().toISOString(),
            }
          : b
      )
    );
  }

  return {
    books,
    setBooks,
    open,
    setOpen,
    page,
    setPage,
    handleAddReading,
    handleUpdateProgress,
    handleAddReview,
  };
}
