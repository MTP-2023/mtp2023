import React, { useRef, useState, useEffect } from "react";

const SelectComponent = ({ options, selectedOption, onChange }) => {
  const selectRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDocumentClick = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleSelectToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="custom-select-container" ref={selectRef}>
      <div
        className={`custom-select ${isOpen ? "open" : ""}`}
        onClick={handleSelectToggle}
      >
        <div className="selected-option">{selectedOption}</div>
        <div className="dropdown-icon">
          <i className={`fas fa-caret-${isOpen ? "up" : "down"}`} />
        </div>
      </div>
      {isOpen && (
        <ul className="option-list">
          {options.map((option) => (
            <li
              className={`option ${
                selectedOption === option.value ? "active" : ""
              }`}
              key={option.value}
              onClick={() => {
                onChange({ target: { value: option.value } });
                handleSelectToggle();
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectComponent;
