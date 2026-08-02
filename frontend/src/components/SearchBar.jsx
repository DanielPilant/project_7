import styles from "./SearchBar.module.css";

// Controlled search input. State lives in the parent (CatalogPage).
export default function SearchBar({ value, onChange }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>🔍</span>
      <input
        className={styles.input}
        type="search"
        placeholder="Search sound packs…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
