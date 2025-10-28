import React, { useState } from 'react';
import type { Amenity, PackageService, View } from '../types';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';

interface ManageAmenitiesProps {
    amenities: Amenity[];
    setAmenities: React.Dispatch<React.SetStateAction<Amenity[]>>;
    packageServices: PackageService[];
    setPackageServices: React.Dispatch<React.SetStateAction<PackageService[]>>;
    setView: (view: View) => void;
}

const ManageAmenities: React.FC<ManageAmenitiesProps> = ({ amenities, setAmenities, packageServices, setPackageServices, setView }) => {
    const [amenityName, setAmenityName] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [error, setError] = useState('');

    const handleAddAmenity = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!amenityName.trim()) {
            setError('O nome da comodidade não pode estar em branco.');
            return;
        }
        if (amenities.some(a => a.name.toLowerCase() === amenityName.trim().toLowerCase())) {
            setError('Uma comodidade com este nome já existe.');
            return;
        }
        setAmenities(prev => [...prev, { id: `amenity_${Date.now()}`, name: amenityName.trim() }]);
        setAmenityName('');
    };

    const handleAddService = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!serviceName.trim()) {
            setError('O nome do serviço não pode estar em branco.');
            return;
        }
        if (packageServices.some(s => s.name.toLowerCase() === serviceName.trim().toLowerCase())) {
            setError('Um serviço com este nome já existe.');
            return;
        }
        setPackageServices(prev => [...prev, { id: `ps_${Date.now()}`, name: serviceName.trim() }]);
        setServiceName('');
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('home')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ArrowLeft size={16}/> Voltar
                </button>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Gerenciar Comodidades e Serviços</h2>
            </div>
            
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg mb-4">{error}</p>}
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Gerenciar Comodidades */}
                <div className="space-y-4">
                    <form onSubmit={handleAddAmenity} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-3">
                        <h3 className="text-xl font-bold">Comodidades dos Quartos</h3>
                        <div className="flex gap-2">
                            <input type="text" value={amenityName} onChange={e => setAmenityName(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-lg" placeholder="Ex: Hidromassagem"/>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Adicionar</button>
                        </div>
                    </form>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <ul className="space-y-2">
                            {amenities.map(amenity => (
                                <li key={amenity.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="font-semibold">{amenity.name}</p>
                                    <button onClick={() => setAmenities(prev => prev.filter(a => a.id !== amenity.id))} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Gerenciar Serviços para Pacotes */}
                <div className="space-y-4">
                    <form onSubmit={handleAddService} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-3">
                        <h3 className="text-xl font-bold">Serviços para Pacotes</h3>
                        <div className="flex gap-2">
                            <input type="text" value={serviceName} onChange={e => setServiceName(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-lg" placeholder="Ex: Jantar Romântico"/>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Adicionar</button>
                        </div>
                    </form>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <ul className="space-y-2">
                            {packageServices.map(service => (
                                <li key={service.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="font-semibold">{service.name}</p>
                                    <button onClick={() => setPackageServices(prev => prev.filter(s => s.id !== service.id))} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAmenities;
