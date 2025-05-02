import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputFieldProps } from "@/types/auth";

export const InputField = ({ id, name, label, type, icon, placeholder, value, onChange, error, rightElement }: InputFieldProps) => (
  <div className="grid gap-2">
    {label && (
      <Label htmlFor={id} className="text-gray-700">
        {label}
      </Label>
    )}

    <div className="relative">
      {icon && <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">{icon}</div>}

      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10", icon && "pl-10", rightElement && "pr-10", error && "border-red-300 focus:border-red-500 focus:ring-red-500")}
        placeholder={placeholder}
      />

      {rightElement}
    </div>

    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
