import React from 'react';
import { LogIn } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="font-bold text-lg">Venta Gaming</div>
      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
        <LogIn size={18} /> Login
      </button>
    </nav>
  );
}
