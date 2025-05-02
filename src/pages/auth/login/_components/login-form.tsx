import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/auth";
import { FormErrors } from "@/utils/errorHandler";
import { LoginFormData } from "@/types/auth";
import { InputField } from "./input-field";
import { LoginHeader } from "./login-header";
import { LoginFooter } from "./login-footer";
import { PasswordField } from "./password-field";
import { LoginButton } from "./login-button";
import { LoginCardHeader } from "./login-card-header";
import { ErrorMessage } from "./error-message";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors<LoginFormData>>({});
  const navigate = useNavigate();
  const { login, checkAuthRedirect } = useAuth();

  const updateFormData = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const success = await login(formData.email, formData.password, setErrors);

      if (success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: "Terjadi kesalahan saat menghubungi server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthRedirect(false, "/");
  }, [checkAuthRedirect]);

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      <LoginHeader />

      <Card className="border-gray-200 shadow-lg overflow-hidden w-full">
        <LoginCardHeader />

        <CardContent className="pt-4">
          <ErrorMessage message={errors.general} />

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <InputField
                id="email"
                label="Username atau Email"
                type="text"
                icon={<Mail className="h-4 w-4" />}
                placeholder="masukkan email anda"
                value={formData.email}
                onChange={(value) => updateFormData("email", value)}
                error={errors.email}
              />

              <PasswordField value={formData.password} onChange={(value) => updateFormData("password", value)} error={errors.password} />

              <LoginButton isLoading={isLoading} />
            </div>
          </form>
        </CardContent>
      </Card>

      <LoginFooter />
    </div>
  );
}
