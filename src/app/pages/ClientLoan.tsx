import { useState } from "react";
import { motion } from "motion/react";
import { Calculator } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

export default function ClientLoan() {
  const [loanAmount, setLoanAmount] = useState(45000000);
  const [downPayment, setDownPayment] = useState(9000000);
  const [loanTerm, setLoanTerm] = useState(20);
  const [interestRate, setInterestRate] = useState(7.5);

  const monthlyPayment = () => {
    const principal = loanAmount - downPayment;
    if (principal <= 0 || loanTerm <= 0) return 0;
    if (interestRate === 0) return +(principal / (loanTerm * 12)).toFixed(2);
    
    const r = interestRate / 100 / 12; 
    const n = loanTerm * 12;
    return +(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Breadcrumb items={[{ label: "Dashboard", path: "/client/dashboard" }, { label: "Simulateur", path: "/client/loan" }]} />
        <h1 className="text-3xl text-[#0a0f1e] mt-2 mb-2 font-bold">Simulateur de Prêt</h1>
        <p className="text-gray-600">Estimez vos mensualités pour votre futur projet immobilier.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#0a0f1e] font-semibold mb-2">Montant du bien (FCFA)</label>
              <input type="number" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm text-[#0a0f1e] font-semibold mb-2">Apport personnel (FCFA)</label>
              <input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#0a0f1e] font-semibold mb-2">Durée (Années)</label>
                <input type="number" value={loanTerm} onChange={e => setLoanTerm(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm text-[#0a0f1e] font-semibold mb-2">Taux d'intérêt (%)</label>
                <input type="number" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} step="0.1" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0a0f1e] to-[#1a2540] p-8 rounded-2xl flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4af37]/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <Calculator className="w-12 h-12 text-[#d4af37] mb-6 relative z-10" />
            <p className="text-gray-300 mb-2 relative z-10 font-medium">Mensualité Estimée</p>
            <p className="text-4xl lg:text-5xl font-bold text-[#d4af37] mb-3 relative z-10">
              {monthlyPayment().toLocaleString('fr-FR')} <span className="text-2xl">FCFA</span>
            </p>
            <p className="text-sm text-gray-400 relative z-10">Par mois pendant {loanTerm} ans</p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}