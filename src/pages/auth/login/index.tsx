import { LoginForm } from "./_components/login-form";

export default function Login() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      {/* Elemen dekoratif */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600 rounded-b-[30%] opacity-5" />
      <div className="absolute bottom-0 right-0 w-full h-64 bg-blue-400 rounded-t-[30%] opacity-5" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-300 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-300 rounded-full blur-3xl opacity-20" />

      {/* Pola titik-titik dekoratif */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiLz48L3N2Zz4=')] opacity-30" />

      <div className="w-full max-w-md z-10 px-6 md:px-10">
        <LoginForm />
      </div>
    </div>
  );
}
