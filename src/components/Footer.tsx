const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="py-4 bg-white border-t border-gray-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <p className="text-sm text-center text-gray-500">
          &copy; {currentYear} PT. SAJP. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
