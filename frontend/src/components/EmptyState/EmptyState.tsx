import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400 text-center">
      <Icon className="w-10 h-10 mb-3 text-gray-300" />
      <span className="text-lg font-medium mb-1">{title}</span>
      {description && <span className="text-sm">{description}</span>}
    </div>
  );
}
