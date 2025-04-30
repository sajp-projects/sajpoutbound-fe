import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";
import { InputField } from "./input-field";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const PasswordField = ({ value, onChange, error }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const passwordToggle = (
    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="password" className="text-gray-700">
          Password
        </Label>
        <a href="#" className="ml-auto inline-block text-xs font-medium text-blue-600 underline-offset-4 hover:underline">
          Lupa password?
        </a>
      </div>

      <InputField id="password" label="" type={showPassword ? "text" : "password"} icon={<Lock className="h-4 w-4" />} placeholder="masukkan password anda" value={value} onChange={onChange} error={error} rightElement={passwordToggle} />
    </div>
  );
};
