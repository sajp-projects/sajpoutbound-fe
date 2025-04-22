import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/auth";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, checkAuthRedirect } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      navigate("/");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthRedirect(false, "/");
  }, [checkAuthRedirect]);

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      <div className="flex flex-col items-center mb-2">
        <span className="text-3xl font-bold text-blue-600">OUTMANAGE</span>
        <div className="mt-1 text-sm text-gray-500 font-medium">Sistem Manajemen DO</div>
        <div className="w-20 h-1 bg-blue-500 rounded-full mt-3"></div>
      </div>

      <Card className="border-gray-200 shadow-lg overflow-hidden w-full">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 border-b border-gray-100 py-4">
          <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
          <CardDescription className="text-gray-600 mt-1">Sistem Informasi Mengelola Pengeluaran Barang</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-700">
                  Username atau Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input onChange={(e) => setEmail(e.target.value)} id="email" type="email" required className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10" placeholder="masukkan email anda" />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <a href="#" className="ml-auto inline-block text-xs font-medium text-blue-600 underline-offset-4 hover:underline">
                    Lupa password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                    placeholder="masukkan password anda"
                  />
                  <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
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
            </div>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-gray-500 mt-1">&copy; {new Date().getFullYear()} Outmanage. Hak Cipta Dilindungi.</p>
    </div>
  );
}
