import React, { useState } from 'react';
import type { Product } from '../types';
import { PlusCircle, Trash2 } from 'lucide-react';

interface RegisterProductProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const RegisterProduct: React.FC<RegisterProductProps> = ({ products, setProducts }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const priceNumber = parseFloat(price);
        if (!name.trim() || isNaN(priceNumber) || priceNumber <= 0) {
            setError('Por favor, insira um nome válido e um preço positivo.');
            return;
        }
        if (products.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
            setError('Um produto com este nome já existe.');
            return;
        }

        const newProduct: Product = {
            id: `prod_${Date.now()}`,
            name: name.trim(),
            price: priceNumber,
        };

        setProducts(prev => [...prev, newProduct]);
        setName('');
        setPrice('');
    };

    const handleRemove = (id: string) => {
        // Prevent removal of core meal items
        if (['meal_breakfast', 'meal_lunch', 'meal_dinner'].includes(id)) {
            alert('Não é possível remover os itens de refeição padrão.');
            return;
        }
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Gerenciar Produtos e Serviços</h2>
            
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 space-y-4">
                 <h3 className="text-xl font-bold">Adicionar Novo Item</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium mb-1">Nome do Produto/Serviço</label>
                        <input type="text" id="productName" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Ex: Água, Lavanderia"/>
                    </div>
                    <div>
                        <label htmlFor="productPrice" className="block text-sm font-medium mb-1">Preço (R$)</label>
                        <input type="number" id="productPrice" value={price} onChange={e => setPrice(e.target.value)} required min="0.01" step="0.01" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Ex: 5.50"/>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="text-right pt-2">
                    <button type="submit" className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700">
                        <PlusCircle size={18} /> Adicionar
                    </button>
                </div>
            </form>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Itens Cadastrados</h3>
                <ul className="space-y-2">
                    {products.map(product => (
                        <li key={product.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                            <button
                                onClick={() => handleRemove(product.id)}
                                disabled={['meal_breakfast', 'meal_lunch', 'meal_dinner'].includes(product.id)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                                title={['meal_breakfast', 'meal_lunch', 'meal_dinner'].includes(product.id) ? "Item padrão não pode ser removido" : "Remover"}
                            >
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RegisterProduct;
