interface ErrorMessageProps {
  message?: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;

  return <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{message}</div>;
};
