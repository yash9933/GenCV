/**
 * Two Column Layout Component
 */
const TwoColumnLayout = ({ 
  leftColumn, 
  rightColumn, 
  leftTitle = '', 
  rightTitle = '',
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <div className="space-y-4">
        {leftTitle && (
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            {leftTitle}
          </h3>
        )}
        {leftColumn}
      </div>
      
      <div className="space-y-4">
        {rightTitle && (
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            {rightTitle}
          </h3>
        )}
        {rightColumn}
      </div>
    </div>
  );
};

export default TwoColumnLayout;

