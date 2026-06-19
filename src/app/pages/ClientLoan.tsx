import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calculator, DollarSign, Calendar, Percent, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import Breadcrumb from "../components/Breadcrumb";
import { toast } from "sonner";

export default function ClientLoan() {
  const [amount, setAmount] = useState<number>(150000000);
  const [downPayment, setDownPayment] = useState<number>(30000000);
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
    
    // Formule d'annuité constante de remboursement de prêt
    const payment = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    if (isFinite(payment) && payment > 0) {
      setMonthlyPayment(payment);
    } else {
      setMonthlyPayment(0);
    }
  }, [amount, downPayment, years, rate]);

  const formatFCFA = (val: number) => 
    new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 }).format(val);

  const handleSaveSimulation = () => {
    toast.success("Votre simulation de financement a été enregistrée dans votre espace conseiller.");
  };

  return (
    <div className="space-y-6 text-[#0a0f1e]">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumb items={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Simulateur de Prêt", path: "/client/loan" }
        ]} />
        <h1 className="text-3xl mt-2 mb-2 font-bold">Simulateur de Prêt</h1>
        <p className="text-gray-500 text-sm">Estimez la capacité de financement de vos futurs projets immobiliers.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Formulaire des Paramètres (Colonne de Gauche) */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#d4af37]" /> Configuration du Crédit
          </h2>

          {/* Prix du bien */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">Prix indicatif du bien immobiliers</label>
              <span className="text-sm font-bold text-[#d4af37]">{formatFCFA(amount)} FCFA</span>
            </div>
            <div className="relative flex items-center gap-4">
              <input 
                type="range" min="10000000" max="1000000000" step="5000000"
                value={amount} onChange={e => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
            </div>
          </div>

          {/* Apport Personnel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">Apport Personnel</label>
              <span className="text-sm font-bold text-gray-600">{formatFCFA(downPayment)} FCFA</span>
            </div>
            <div className="relative flex items-center gap-4">
              <input 
                type="range" min="0" max={amount} step="1000000"
                value={downPayment} onChange={e => setDownPayment(Number(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
            </div>
            {downPayment >= amount && (
              <p className="text-[11px] text-amber-600 font-medium">L'apport couvre la totalité du capital du bien.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Durée du prêt */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" /> Durée ({years} ans)
              </label>
              <select
                value={years} onChange={e => setYears(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#d4af37] focus:outline-none bg-white cursor-pointer"
              >
                <option value="5">5 ans (60 mois)</option>
                <option value="10">10 ans (120 mois)</option>
                <option value="15">15 ans (180 mois)</option>
                <option value="20">20 ans (240 mois)</option>
                <option value="25">25 ans (300 mois)</option>
              </select>
            </div>

            {/* Taux d'intérêt annuel */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Percent className="w-4 h-4 text-gray-400" /> Taux d'intérêt annuel
              </label>
              <div className="relative">
                <input
                  type="number" step="0.1" min="0.1" max="25"
                  value={rate} onChange={e => setRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#d4af37] focus:outline-none pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau de Résultat (Colonne de Droite) */}
        <div className="flex-1 bg-gradient-to-br from-[#0a0f1e] to-[#1a2540] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-inner">
              <Calculator className="w-6 h-6 text-[#d4af37]" />
            </div>
            
            <h3 className="text-gray-400 font-medium mb-2 uppercase tracking-widest text-xs">
              Mensualité Estimée
            </h3>
            
            <div className="text-4xl md:text-5xl font-black text-[#d4af37] mb-1 tracking-tight">
              {formatFCFA(monthlyPayment)}
            </div>
            
            <p className="text-[#d4af37] font-bold text-lg mb-6">FCFA / mois</p>
            
            {/* Tableau récapitulatif condensé */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Montant du crédit :</span>
                <span className="text-white font-semibold">{formatFCFA(Math.max(0, amount - downPayment))} FCFA</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Nombre d'échéances :</span>
                <span className="text-white font-semibold">{years * 12} mensualités</span>
              </div>
              <div className="flex justify-between text-gray-400 border-t border-white/10 pt-2">
                <span>Coût total estimé (hors assurance) :</span>
                <span className="text-[#d4af37] font-bold">{formatFCFA(monthlyPayment * years * 12)} FCFA</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button
                type="button" onClick={handleSaveSimulation}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm border border-white/10 transition-colors shadow-sm"
              >
                Sauvegarder
              </button>
              <Link
                to="/contact"
                className="flex-1 py-3 bg-[#d4af37] hover:bg-[#b8952e] text-[#0a0f1e] font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#d4af37]/10"
              >
                <span>Contacter l'agence</span> <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-6 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span>Simulation purement indicative sans valeur contractuelle</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}