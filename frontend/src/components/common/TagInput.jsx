import { useState } from "react";
import "./TagInput.css";

export default function TagInput({
  label,
  tags = [],
  onChange,
  placeholder = "Nhập và nhấn Enter",
  error,
}) {
  const [input, setInput] = useState("");

  const addTag = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...tags, trimmed]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="tag-input-group">
      {label && <label className="form-label">{label}</label>}
      <div className={`tag-input-box ${error ? "error" : ""}`}>
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="tag-chip">
            {tag}
            <button
              type="button"
              className="tag-remove"
              onClick={() => removeTag(index)}
              aria-label={`Xóa ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="tag-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
