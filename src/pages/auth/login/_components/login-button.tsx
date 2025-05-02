import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  isLoading: boolean;
}

export const LoginButton = ({ isLoading }: LoginButtonProps) => (
  <Button type="submit" loading={isLoading} leftIcon={!isLoading ? <LogIn className="h-4 w-4" /> : undefined} fullWidth size="lg" variant="default">
    {isLoading ? "Memproses..." : "Masuk"}
  </Button>
);
