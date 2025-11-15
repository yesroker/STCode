import { useContext } from 'react';
import { cn } from '../../utils';
import { AppContext } from '../../AppContext';

const DiffToggle = () => {
  const appContext = useContext(AppContext);
  if (!appContext) return;
  const handleToggle = () => {
    const newMode = appContext.currentMode === 'Code' ? 'Diff' : 'Code';
    appContext.setCurrentMode(newMode);
  };

  return (
<button
      onClick={handleToggle}
      className={cn(
        'relative inline-flex p-1 h-6 rounded-full w-11 transition-colors duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        {
          'bg-indigo-600': appContext.currentMode === 'Diff',
          'bg-gray-400': appContext.currentMode === 'Code',
        },
      )}
    >
      <span
        className={cn(
          'inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out',
          {
            // --- 修复 ---
            'translate-x-2': appContext.currentMode === 'Diff',
            'translate-x-0': appContext.currentMode === 'Code',
          },
        )}
      />
    </button>
  );
};

export default DiffToggle;