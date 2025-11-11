export default function Shelf({ children }) {
  return (
    <div className="relative my-4 w-full">
      <div
        className="h-3 rounded-t-xl shadow"
        style={{ background: "#e8d7bd" }}
      />
      <div
        className="min-h-[170px] w-full border-b-[10px] p-4 shadow-inner"
        style={{
          background: "linear-gradient(180deg,#efe2cf,#e6d5be)",
          borderColor: "#d7c3a8",
        }}
      >
        {children}
      </div>
    </div>
  );
}
