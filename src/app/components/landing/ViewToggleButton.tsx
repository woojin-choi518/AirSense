'use client';

interface ViewToggleButtonProps {
  view: 'first' | 'second';
  onViewChange: (view: 'first' | 'second') => void;
  isDark: boolean;
}

export default function ViewToggleButton({ view, onViewChange, isDark }: ViewToggleButtonProps) {
  const buttonClass = isDark 
    ? 'bg-[#5a2a1a] text-[#F5E6C8]' 
    : 'bg-gray-200 text-gray-800';
  const activeButtonClass = isDark 
    ? 'bg-amber-500 text-white' 
    : 'bg-green-500 text-white';

  return (
    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={() => onViewChange('first')}
        className={`px-4 py-2 rounded-lg transition ${
          view === 'first' ? activeButtonClass : buttonClass
        }`}
      >
        page
      </button>
      <button
        onClick={() => onViewChange('second')}
        className={`px-4 py-2 rounded-lg transition ${
          view === 'second' ? activeButtonClass : buttonClass
        }`}
      >
        function
      </button>
    </div>
  );
}
