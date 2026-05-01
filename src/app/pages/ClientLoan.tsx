import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calculator } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

export default function ClientLoan() {
  const [amount, setAmount] = useState<number>(500000000);
  const [downPayment, setDownPayment] = useState<number>(50000000);
  const [years, setYears] = useState<number>(20);
  const [rate, setRate] = useState<number>(7.5);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  // Moteur de calcul financier strict
  useEffect(() => {
    const principal = amount - downPayment;
    
    if (principal <= 0 || years <= 0 || rate <= 0) {
      setMonthlyPayment(0);
      return;
    }

    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;
    
    // Formule d'annuité constante
    const payment = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    setMonthlyPayment(payment);
  }, [amount, downPayment, years, rate]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Breadcrumb items={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Simulateur", path: "/client/loan" }
        ]} />
        <h1 className="text-3xl text-[#0a0f1e] mt-2 mb-2 font-bold">Simulateur de Prêt</h1>
        <p className="text-gray-600">Estimez vos mensualités pour votre futur projet immobilier.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 flex flex-col xl:flex-row gap-8"
      >
        {/* Colonne Inputs (Contraste corrigé) */}
        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#0a0f1e] mb-2">
              Montant du bien (FCFA)
            </label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 outline-none transition-all font-bold text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0a0f1e] mb-2">
              Apport personnel (FCFA)
            </label>
            <input
              type="number"
              value={downPayment || ""}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 outline-none transition-all font-bold text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0a0f1e] mb-2">
                Durée (Années)
              </label>
              <input
                type="number"
                value={years || ""}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 outline-none transition-all font-bold text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0a0f1e] mb-2">
                Taux d'intérêt (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={rate || ""}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 outline-none transition-all font-bold text-lg"
              />
            </div>
          </div>
        </div>

        {/* Colonne Résultat (Fond sombre) */}
        <div className="flex-1 bg-gradient-to-br from-[#0a0f1e] to-[#1a2540] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
          {/* Décoration d'arrière-plan */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <Calculator className="w-8 h-8 text-[#d4af37]" />
            </div>
            
            <h3 className="text-gray-300 font-medium mb-4 uppercase tracking-wider text-sm">
              Mensualité Estimée
            </h3>
            
            <div className="text-4xl md:text-5xl lg:text-6xl font-black text-[#d4af37] mb-2 tracking-tight">
              {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(monthlyPayment)}
            </div>
            
            <p className="text-[#d4af37] font-bold text-2xl mb-6">FCFA</p>
            
            <div className="w-16 h-px bg-gray-600 mb-6" />
            
            <p className="text-gray-400 text-sm font-medium">
              Par mois pendant <span className="text-white">{years} ans</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}