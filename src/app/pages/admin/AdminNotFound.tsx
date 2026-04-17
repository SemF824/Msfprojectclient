import { Link } from "react-router";
import { Home, Search, ArrowLeft, LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
            404
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-[#0a0f1e]" />
          </div>

          <h2 className="text-3xl md:text-4xl text-[#0a0f1e] font-bold mb-4">
            Page Admin Introuvable
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Cette page du panneau d'administration n'existe pas ou a été déplacée.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard Admin
            </Link>
          </div>
        </div>

        {/* Popular Admin Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/dashboard"
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#d4af37] transition-colors text-gray-700 hover:text-[#d4af37]"
          >
            <p className="text-sm font-medium">Dashboard</p>
          </Link>
          <Link
            to="/demandes"
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#d4af37] transition-colors text-gray-700 hover:text-[#d4af37]"
          >
            <p className="text-sm font-medium">Demandes</p>
          </Link>
          <Link
            to="/proprietes"
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#d4af37] transition-colors text-gray-700 hover:text-[#d4af37]"
          >
            <p className="text-sm font-medium">Propriétés</p>
          </Link>
          <Link
            to="/clients"
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#d4af37] transition-colors text-gray-700 hover:text-[#d4af37]"
          >
            <p className="text-sm font-medium">Clients</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
