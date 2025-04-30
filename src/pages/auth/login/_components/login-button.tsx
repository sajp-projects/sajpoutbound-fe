import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  isLoading: boolean;
}

export const LoginButton = ({ isLoading }: LoginButtonProps) => (
  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 transition-all duration-300 flex items-center justify-center gap-2 h-11 mt-2" disabled={isLoading}>
    {isLoading ? (
      <>
        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
        <span>Memproses...</span>
      </>
    ) : (
      <>
        <LogIn className="h-4 w-4" />
        <span>Masuk</span>
      </>
    )}
  </Button>
);
