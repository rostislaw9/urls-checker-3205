import { Loader2 } from 'lucide-react';

export function Loading({ message = 'Загрузка...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8 text-gray-500 text-sm">
      <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-500" />
      {message}
    </div>
  );
}
