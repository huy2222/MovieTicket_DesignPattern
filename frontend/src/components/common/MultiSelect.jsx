import { useState, useRef, useEffect } from "react";
import "./MultiSelect.css";

export default function MultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Chọn thể loại",
  error,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionId) => {
    if (value.includes(optionId)) {
      onChange(value.filter((id) => id !== optionId));
    } else {
      onChange([...value, optionId]);
    }
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.id))
    .map((opt) => opt.name);

  return (
    <div className="multi-select-group" ref={containerRef}>
      {label && <label className="form-label">{label}</label>}
      <button
        type="button"
        className={`multi-select-trigger ${error ? "error" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={selectedLabels.length === 0 ? "placeholder" : ""}>
          {selectedLabels.length > 0
            ? selectedLabels.join(", ")
            : placeholder}
        </span>
        <span className="multi-select-arrow">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="multi-select-dropdown">
          {options.length === 0 ? (
            <div className="multi-select-empty">Không có thể loại</div>
          ) : (
            options.map((opt) => (
              <label key={opt.id} className="multi-select-option">
                <input
                  type="checkbox"
                  checked={value.includes(opt.id)}
                  onChange={() => toggleOption(opt.id)}
                />
                <span>{opt.name}</span>
              </label>
            ))
          )}
        </div>
      )}

      {value.length > 0 && (
        <div className="multi-select-chips">
          {selectedLabels.map((name) => (
            <span key={name} className="multi-select-chip">
              {name}
            </span>
          ))}
        </div>
      )}

      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
