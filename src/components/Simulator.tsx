import React, { useState, useMemo } from 'react';
// FIX: Removed .ts extension from import path.
import type { Product } from '../types';
import { Share2 } from 'lucide-react';

interface SimulatorProps {
    products: Product[];
}

const Simulator: React.FC<SimulatorProps> = ({ products }) => {
    const [nights, setNights] = useState(1);
    const [dailyRate, setDailyRate] = useState(150);
    const [mealPackage, setMealPackage] = useState({
        breakfast: false,
        lunch: false,
        dinner: false,
    });
    const [shareSuccess, setShareSuccess] = useState(false);

    const handleMealChange = (meal: 'breakfast' | 'lunch' | 'dinner') => {
        setMealPackage(prev => ({ ...prev, [meal]: !prev[meal] }));
    };

    const roomTotal = useMemo(() => (dailyRate || 0) * (nights || 0), [dailyRate, nights]);

    const mealPackageTotal = useMemo(() => {
        let dailyMealCost = 0;
        if (mealPackage.breakfast) dailyMealCost += products.find(p => p.id === 'meal_breakfast')?.price || 0;
        if (mealPackage.lunch) dailyMealCost += products.find(p => p.id === 'meal_lunch')?.price || 0;
        if (mealPackage.dinner) dailyMealCost += products.find(p => p.id === 'meal_dinner')?.price || 0;
        return dailyMealCost * (nights || 0);
    }, [mealPackage, nights, products]);

    const grandTotal = roomTotal + mealPackageTotal;
    
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const handleShare = async () => {
        const textToShare = `*Orçamento de Hospedagem - HostManager*

*Detalhes:*
- Número de Diárias: ${nights}
- Valor da Diária: ${formatCurrency(dailyRate)}

*Pacotes Inclusos:*
- Café da Manhã: ${mealPackage.breakfast ? 'Sim' : 'Não'}
- Almoço: ${mealPackage.lunch ? 'Sim' : 'Não'}
- Jantar: ${mealPackage.dinner ? 'Sim' : 'Não'}

*Resumo Financeiro:*
- Total Hospedagem: ${formatCurrency(roomTotal)}
- Total Pacotes Refeição: ${formatCurrency(mealPackageTotal)}
----------------------------------
*VALOR TOTAL:* *${formatCurrency(grandTotal)}*
        `.trim().replace(/^\s+/gm, ''); // Remove leading spaces from each line for better formatting

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Orçamento de Hospedagem',
                    text: textToShare,
                });
            } catch (error) {
                console.error('Erro ao compartilhar:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(textToShare);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 3000);
            } catch (err) {
                console.error('Falha ao copiar:', err);
                alert('Não foi possível copiar o orçamento.');
            }
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Simulador de Pacotes e Orçamentos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulário de Simulação */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
                    <div>
                        <label htmlFor="nights" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Diárias</label>
                        <input
                            type="number" id="nights" value={nights}
                            onChange={(e) => setNights(Math.max(1, parseInt(e.target.value, 10)) || 1)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                        />
                    </div>
                    <div>
                        <label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Diária (R$)</label>
                        <input
                            type="number" id="dailyRate" value={dailyRate}
                            onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            step="0.01" min="0"
                        />
                    </div>
                    <div className="pt-4 border-t dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pacotes de Refeição (Opcional)</label>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="flex items-center">
                                <input type="checkbox" id="sim_breakfast" checked={mealPackage.breakfast} onChange={() => handleMealChange('breakfast')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="sim_breakfast" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Café da Manhã</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="sim_lunch" checked={mealPackage.lunch} onChange={() => handleMealChange('lunch')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="sim_lunch" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Almoço</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="sim_dinner" checked={mealPackage.dinner} onChange={() => handleMealChange('dinner')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="sim_dinner" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Jantar</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumo do Orçamento */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg space-y-4 flex flex-col">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">Resumo do Orçamento</h3>
                    <div className="space-y-2 flex-grow">
                        <div className="flex justify-between items-center text-md">
                            <span className="text-gray-600 dark:text-gray-400">Total Hospedagem ({nights}x):</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(roomTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-md">
                            <span className="text-gray-600 dark:text-gray-400">Total Pacotes Refeição:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(mealPackageTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold text-blue-600 dark:text-blue-400 pt-3 border-t dark:border-gray-600 mt-3">
                            <span>VALOR TOTAL:</span>
                            <span>{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>
                     <div className="mt-auto pt-4">
                        <button 
                          onClick={handleShare}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                        >
                          <Share2 size={16} /> Compartilhar Orçamento
                        </button>
                        {shareSuccess && <p className="text-green-500 text-sm mt-2 text-center">Orçamento copiado para a área de transferência!</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulator;