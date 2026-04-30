import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  leftEl?: ReactNode;
  rightEl?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, success, hint, leftEl, rightEl, className = '', ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftEl && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">{leftEl}</div>
        )}
        <input
          ref={ref}
          {...props}
          className={`
            w-full border rounded-xl px-4 py-3 text-base outline-none
            transition-all duration-150 bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            ${leftEl ? 'pl-10' : ''}
            ${rightEl ? 'pr-10' : ''}
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
              : success
              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900'
              : 'border-gray-200 dark:border-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900'
            }
            ${className}
          `}
        />
        {(rightEl || success || error) && (
          <div className="absolute right-3 flex items-center">
            {rightEl}
            {!rightEl && success && <CheckCircle2 size={18} className="text-emerald-500" />}
            {!rightEl && error && <AlertCircle size={18} className="text-red-400" />}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
