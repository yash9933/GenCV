/**
 * Reusable Toggle Switch Component
 */
const ToggleSwitch = ({ 
  enabled, 
  onChange, 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const toggleClasses = `
    toggle-switch ${enabled ? 'enabled' : 'disabled'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;
  
  const thumbClasses = `
    toggle-switch-thumb ${enabled ? 'enabled' : 'disabled'}
  `;
  
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={toggleClasses}
      {...props}
    >
      <span className={thumbClasses} />
    </button>
  );
};

export default ToggleSwitch;

