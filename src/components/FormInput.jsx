import React, { useState, useId } from "react";

const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value ? true : false);
  const inputId = useId();

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (onChange) {
      onChange(e);
    }
  };

  const inputClasses = `
    form-input
    ${error ? "form-input--error" : ""}
    ${disabled ? "form-input--disabled" : ""}
    ${className}
  `.trim();

  const labelClasses = `
    form-label
    ${isFocused || hasValue ? "form-label--floating" : ""}
    ${error ? "form-label--error" : ""}
    ${disabled ? "form-label--disabled" : ""}
  `.trim();

  return (
    <div className="form-field">
      <div className="form-input-container">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ""}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="form-label-required">*</span>}
        </label>
      </div>
      {error && (
        <div className="form-error" role="alert">
          <span className="form-error-icon">⚠</span>
          <span className="form-error-text">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
