interface Props {
  value: string;
  currentTab: string;
  className?: string;
  children: React.ReactNode;
}

export const TabPanel = ({ value, currentTab, className, children }: Props) => {
  if (value !== currentTab) return null;
  
  return (
    <div className={`h-full ${className}`}>
      {children}
    </div>
  );
}; 