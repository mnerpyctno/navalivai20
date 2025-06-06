interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-64">
      <div className="text-red-500 text-center">
        <p className="text-lg font-medium">Произошла ошибка</p>
        <p className="text-sm mt-2">{message}</p>
      </div>
    </div>
  );
}; 