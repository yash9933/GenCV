/**
 * Reusable Checkbox Component
 */
const Checkbox = ({ 
  checked, 
  onChange, 
  label = '', 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const checkboxClasses = `
    h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;
  
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={checkboxClasses}
        {...props}
      />
      {label && (
        <label className={`ml-2 text-sm text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;

