/**
 * Reusable Toggle Switch Component
 */
const ToggleSwitch = ({ 
  checked, 
  onChange, 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const toggleClasses = `
    toggle-switch ${checked ? 'enabled' : 'disabled'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;
  
  const thumbClasses = `
    toggle-switch-thumb ${checked ? 'enabled' : 'disabled'}
  `;
  
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={toggleClasses}
      {...props}
    >
      <span className={thumbClasses} />
    </button>
  );
};

export default ToggleSwitch;

