import { useAuth } from "@/hooks/auth";
import { LoginError, LoginFormData } from "@/types/auth";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { ArrowUp, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

const schema = Joi.object({
  email: Joi.string().required().messages({
    "string.empty": "Email atau Username tidak boleh kosong",
    "any.required": "Email atau Username harus diisi",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password tidak boleh kosong",
    "any.required": "Password harus diisi",
  }),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const { loginMutation, checkAuthRedirect } = useAuth();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: joiResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    form.clearErrors();

    const data = form.getValues();

    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onError: (error: unknown) => {
          try {
            const errorData = error as LoginError;

            // Reset pesan error sebelumnya
            form.clearErrors();
            setGeneralError(null);

            if (
              errorData.errorType === "joiValidationError" &&
              errorData.details &&
              errorData.details.length > 0
            ) {
              errorData.details.forEach(
                (detail: { path: string[]; message: string }) => {
                  // Mapping path dari backend ke field di form
                  const path = detail.path[0];
                  if (path === "email" || path === "username") {
                    form.setError("email", { message: detail.message });
                  } else if (path === "password") {
                    form.setError("password", { message: detail.message });
                  } else {
                    setGeneralError(detail.message);
                  }
                }
              );
            } else if (errorData.message) {
              // Untuk pesan error umum tanpa detail validasi
              setGeneralError(errorData.message);
            } else {
              setGeneralError("Terjadi kesalahan saat login");
            }
          } catch (e) {
            console.error("Error handling login error:", e);
            setGeneralError("Terjadi kesalahan saat menghubungi server");
          }
        },
      }
    );
  };

  useEffect(() => {
    checkAuthRedirect(false, "/");
  }, [checkAuthRedirect]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.getModifierState && event.getModifierState("CapsLock")) {
        setIsCapsLockOn(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.getModifierState && event.getModifierState("CapsLock")) {
        setIsCapsLockOn(true);
      } else {
        setIsCapsLockOn(false);
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600 rounded-b-[30%] opacity-5" />
      <div className="absolute bottom-0 right-0 w-full h-64 bg-blue-400 rounded-t-[30%] opacity-5" />
      <div className="absolute w-64 h-64 bg-blue-300 rounded-full -top-20 -right-20 blur-3xl opacity-20" />
      <div className="absolute w-64 h-64 bg-blue-300 rounded-full -bottom-20 -left-20 blur-3xl opacity-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiLz48L3N2Zz4=')] opacity-30" />

      <div className="z-10 flex flex-col w-full max-w-md gap-4 px-6 md:px-10">
        <div className="flex flex-col items-center mb-2">
          <span className="text-3xl font-bold text-blue-600">OUTMANAGE</span>
          <div className="mt-1 text-sm font-medium text-gray-500">
            Sistem Manajemen DO
          </div>
          <div className="w-20 h-1 mt-3 bg-blue-500 rounded-full"></div>
        </div>

        <Card className="w-full overflow-hidden border-gray-200 shadow-lg">
          <CardHeader className="py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-gray-50">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Login
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              Sistem Informasi Mengelola Pengeluaran Barang
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {generalError && (
              <div className="p-3 mb-4 text-sm font-semibold text-red-600 border border-red-300 rounded-md bg-red-50">
                {generalError}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Username atau Email
                      </FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                          <Mail className="w-4 h-4" />
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Masukkan email anda"
                            className={cn(
                              "pl-10 placeholder:text-sm sm:placeholder:text-base",
                              form.formState.errors.email &&
                                "border-red-300 focus:border-red-500 focus:ring-red-500"
                            )}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="font-medium text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-gray-700">
                          Password
                        </FormLabel>
                        <a
                          href="#"
                          className="ml-auto text-xs font-medium text-blue-600 underline-offset-4 hover:underline"
                        >
                          Lupa password?
                        </a>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                          <Lock className="w-4 h-4" />
                        </div>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password anda"
                            className={cn(
                              "pl-10 placeholder:text-sm sm:placeholder:text-base",
                              isCapsLockOn ? "pr-14" : "pr-10",
                              form.formState.errors.password &&
                                "border-red-300 focus:border-red-500 focus:ring-red-500"
                            )}
                            {...field}
                          />
                        </FormControl>
                        {/* Caps Lock Indicator */}
                        {isCapsLockOn && (
                          <div className="absolute inset-y-0 right-8 flex items-center">
                            <div
                              className="flex items-center justify-center w-5 h-5 text-gray-600  rounded  transition-colors"
                              title="Caps Lock is on"
                            >
                              <ArrowUp className="w-3 h-3 hover:text-gray-700" />
                            </div>
                          </div>
                        )}
                        {/* Password Visibility Toggle */}
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <FormMessage className="font-medium text-red-600" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  loading={loginMutation.isPending}
                  leftIcon={
                    !loginMutation.isPending ? (
                      <LogIn className="w-4 h-4" />
                    ) : undefined
                  }
                  fullWidth
                  size="lg"
                  variant="default"
                >
                  {loginMutation.isPending ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="mt-1 text-xs text-center text-gray-500">
          &copy; {new Date().getFullYear()} Outmanage. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
