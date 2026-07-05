import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
      <span className="inline-flex items-center gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        {message}
      </span>
      {onDismiss && (
        <button
          className="border-none text-red-600 cursor-pointer p-0 leading-none hover:text-red-700 transition-colors"
          onClick={onDismiss}
          aria-label="Закрыть ошибку"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
