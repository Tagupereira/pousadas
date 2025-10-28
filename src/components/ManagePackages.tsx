import React, { useState } from 'react';
import type { Package, PackageService } from '../types';
import { PlusCircle, Trash2, Edit3 } from 'lucide-react';

interface ManagePackagesProps {
    packages: Package[];
    setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
    packageServices: PackageService[];
}

const ManagePackages: React.FC<ManagePackagesProps> = ({ packages, setPackages, packageServices }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const priceNumber = parseFloat(price);
        if (!name.trim() || isNaN(priceNumber) || priceNumber < 0) {
            setError('Por favor, insira um nome e preço válidos.');
            return;
        }

        if (editingPackageId) {
            // Update
            setPackages(prev => prev.map(p => p.id === editingPackageId ? { ...p, name: name.trim(), price: priceNumber, description: description.trim(), serviceIds: selectedServices } : p));
        } else {
            // Create
            if (packages.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
                setError('Um pacote com este nome já existe.');
                return;
            }
            const newPackage: Package = {
                id: `pkg_${Date.now()}`,
                name: name.trim(),
                price: priceNumber,
                description: description.trim(),
                serviceIds: selectedServices,
            };
            setPackages(prev => [...prev, newPackage]);
        }
        resetForm();
    };
    
    const resetForm = () => {
        setName('');
        setPrice('');
        setDescription('');
        setSelectedServices([]);
        setEditingPackageId(null);
        setError('');
    };

    const handleEdit = (pkg: Package) => {
        setEditingPackageId(pkg.id);
        setName(pkg.name);
        setPrice(String(pkg.price));
        setDescription(pkg.description);
        setSelectedServices(pkg.serviceIds);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRemove = (id: string) => {
        if (window.confirm("Tem certeza que deseja remover este pacote?")) {
            setPackages(prev => prev.filter(p => p.id !== id));
        }
    };
    
    const handleServiceToggle = (serviceId: string) => {
        setSelectedServices(prev => 
            prev.includes(serviceId) 
                ? prev.filter(id => id !== serviceId) 
                : [...prev, serviceId]
        );
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Gerenciar Pacotes</h2>
            
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 space-y-4">
                 <h3 className="text-xl font-bold">{editingPackageId ? "Editando Pacote" : "Criar Novo Pacote"}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="pkgName" className="block text-sm font-medium mb-1">Nome</label>
                        <input type="text" id="pkgName" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="pkgPrice" className="block text-sm font-medium mb-1">Preço Adicional (R$)</label>
                        <input type="number" id="pkgPrice" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-lg"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="pkgDesc" className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea id="pkgDesc" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-lg" rows={2}></textarea>
                </div>
                <div>
                     <label className="block text-sm font-medium mb-2">Serviços Inclusos</label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {packageServices.map(service => (
                            <label key={service.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md cursor-pointer">
                                <input type="checkbox" checked={selectedServices.includes(service.id)} onChange={() => handleServiceToggle(service.id)} className="h-4 w-4 mr-2"/>
                                {service.name}
                            </label>
                        ))}
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                     {editingPackageId && <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600">Cancelar Edição</button>}
                    <button type="submit" className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                        <PlusCircle size={18} /> {editingPackageId ? "Salvar Alterações" : "Criar Pacote"}
                    </button>
                </div>
            </form>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Pacotes Cadastrados</h3>
                <ul className="space-y-3">
                    {packages.map(pkg => (
                        <li key={pkg.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{pkg.name}</p>
                                    <p className="text-sm text-blue-600 font-medium">{pkg.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    {pkg.description && <p className="text-xs text-gray-500 mt-1">{pkg.description}</p>}
                                    {pkg.serviceIds.length > 0 && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            <strong>Inclui:</strong> {pkg.serviceIds.map(id => packageServices.find(s => s.id === id)?.name || '').join(', ')}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-shrink-0 ml-4">
                                    <button onClick={() => handleEdit(pkg)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full" title="Editar"><Edit3 size={16} /></button>
                                    <button onClick={() => handleRemove(pkg.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full" title="Remover"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ManagePackages;
