import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Bird } from 'lucide-react';

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showSettings?: boolean;
  onBack?: () => void;
}

export default function PageHeader({ title, showBack, showLogo, showSettings, onBack }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 h-14 flex items-center px-4">
      {showBack && (
        <button
          onClick={handleBack}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {showLogo && (
        <div className="flex items-center gap-1.5">
          <Bird size={22} className="text-emerald-500" />
          <span className="font-bold text-gray-900 dark:text-white text-lg">PigeonPay</span>
        </div>
      )}

      {title && (
        <h1 className="font-bold text-gray-900 dark:text-white text-base flex-1 text-center">{title}</h1>
      )}

      {showSettings && (
        <button
          onClick={() => navigate('/settings')}
          className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Settings"
        >
          <Settings size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
      )}

      {!showSettings && (showBack || title) && <div className="w-8 ml-auto" />}
    </header>
  );
}
