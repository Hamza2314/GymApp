import { useState, useRef, useEffect } from "react";
import { getAutocompleteSuggestions } from "../data/exercises";

export default function Autocomplete({ value, onChange, dayName }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    const results = getAutocompleteSuggestions(val, dayName);
    setSuggestions(results);
    setOpen(results.length > 0);
  };

  const handleSelect = (name) => {
    onChange(name);
    setOpen(false);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className="exercise-name-input"
        value={value}
        onChange={handleChange}
        onFocus={() => {
          if (value) {
            const results = getAutocompleteSuggestions(value, dayName);
            setSuggestions(results);
            setOpen(results.length > 0);
          }
        }}
        placeholder="Exercise name"
      />
      {open && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((s) => (
            <div
              key={s}
              className="autocomplete-item"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
