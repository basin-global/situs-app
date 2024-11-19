'use client';

interface Props {
  onClick: () => void;
  className?: string;
  iconUrl?: string;
}

export function SitusToggle({ onClick, className, iconUrl }: Props) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`hover:cursor-pointer p-2 rounded-full bg-black/20 backdrop-blur shadow-lg border-2 border-transparent hover:bg-black/30 transition-colors z-50 ${className}`}
    >
      <img 
        src={iconUrl || '/assets/logos/situs-circle.png'}
        alt="Toggle Panel"
        width={20}
        height={20}
        className="w-5 h-5"
      />
    </button>
  );
} 