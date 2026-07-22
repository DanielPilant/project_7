// Controlled search input. State lives in the parent (CatalogPage).
export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="search"
      type="search"
      placeholder="Search sound packs…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
