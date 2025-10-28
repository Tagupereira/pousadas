import React from 'react';
import { Bed, ShoppingCart, History, Star, Gift, BarChart2 } from 'lucide-react';
import type { View } from '../types';

interface HomeProps {
    setView: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {
    
    const ActionButton: React.FC<{ view: View; icon: React.ReactElement; text: string }> = ({ view, icon, text }) => (
        <button 
            onClick={() => setView(view)}
            className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center w-full space-y-3"
        >
            {/* FIX: Replaced React.cloneElement with React.createElement to resolve type errors with icon props. */}
            {React.createElement(icon.type, { ...icon.props, size: 32, className: "text-blue-600 dark:text-blue-400" })}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{text}</span>
        </button>
    );

    return (
        <div className="animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white">Seja bem-vindo(a)</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">O que você gostaria de fazer hoje?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                <ActionButton 
                    view="checkRoom" 
                    icon={<Bed />} 
                    text="Situação dos Quartos"
                />
                 <ActionButton 
                    view="registerProduct" 
                    icon={<ShoppingCart />} 
                    text="Gerenciar Produtos" 
                />
                 <ActionButton 
                    view="manageAmenities" 
                    icon={<Star />} 
                    text="Gerenciar Comodidades" 
                />
                <ActionButton 
                    view="managePackages" 
                    icon={<Gift />} 
                    text="Gerenciar Pacotes" 
                />
                <ActionButton 
                    view="history" 
                    icon={<History />} 
                    text="Histórico de Contas" 
                />
                <ActionButton 
                    view="simulator" 
                    icon={<BarChart2 />} 
                    text="Simulador de Pacotes" 
                />
            </div>
        </div>
    );
};

export default Home;
