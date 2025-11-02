import { VIEW_TABS, type View } from '@/lib/constants';
import { AppContext } from '@/context/AppContext';
import { useContext } from 'react';

const Views = () => {
  const appContext = useContext(AppContext);

  const handleViewClick = (view: View) => {
    appContext?.setCurrentView(view);
  };
  return (
    <div role="tablist" className="ml-8 flex-wrap min-w-0 flex gap-2 p-1">
      {VIEW_TABS.map(tab => {
        const isActive = appContext?.currentView === tab;

        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleViewClick(tab)}
            className={`
          py-1.5 px-4 rounded-full
          font-medium text-sm
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-600 focus:ring-white
          ${
            isActive
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-200 hover:text-white hover:bg-gray-500'
          }
        `}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default Views;
