interface LoadingStateProps {
  text?: string;
  height?: string;
}

export function LoadingState({ text = "Memuat data...", height = "h-60" }: LoadingStateProps) {
  return (
    <div className={`flex justify-center items-center ${height}`}>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        <p className="mt-4 text-blue-600 font-medium">{text}</p>
      </div>
    </div>
  );
}
