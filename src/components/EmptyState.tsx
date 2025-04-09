interface EmptyStateProps {
  message: string;
  description?: string;
}

export const EmptyState = ({ message, description }: EmptyStateProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-64">
      <div className="text-gray-500 text-center">
        <p className="text-lg font-medium">{message}</p>
        {description && <p className="text-sm mt-2">{description}</p>}
      </div>
    </div>
  );
}; 