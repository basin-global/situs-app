interface Props {
  tabs: Array<{ id: string; label: string }>;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Tabs = ({ tabs, currentTab, onTabChange }: Props) => {
  return (
    <div className="flex items-center space-x-6 px-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            py-3 text-sm font-medium transition-colors relative
            ${currentTab === tab.id 
              ? 'text-white' 
              : 'text-gray-400 hover:text-gray-200'
            }
          `}
        >
          {tab.label}
          {currentTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}; 