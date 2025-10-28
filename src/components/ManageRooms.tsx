import React, { useState } from 'react';
import { PlusCircle, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
// FIX: Removed .ts extension from import path.
import type { HotelRoom, Amenity, View, Room } from '../types';

interface ManageRoomsProps {
    inventory: HotelRoom[];
    amenities: Amenity[];
    rooms: Room[]; // Active rooms
    onAddRoom: (newRoom: HotelRoom) => void;
    onRemoveRoom: (roomNumber: string) => void;
    setView: (view: View) => void;
}

const ManageRooms: React.FC<ManageRoomsProps> = ({ inventory, amenities, rooms, onAddRoom, onRemoveRoom, setView }) => {
    const [roomNumber, setRoomNumber] = useState('');
    const [roomName, setRoomName] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [confirmingDelete, setConfirmingDelete] = useState<HotelRoom | null>(null);

    const handleAddRoom = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const trimmedNumber = roomNumber.trim();
        if (!trimmedNumber) {
            setError('O número do quarto é obrigatório.');
            return;
        }
        if (inventory.some(r => r.number === trimmedNumber)) {
            setError('Um quarto com este número já existe no inventário.');
            return;
        }
        const newRoom: HotelRoom = {
            id: `inv_${Date.now()}`,
            number: trimmedNumber,
            name: roomName.trim() || `Quarto ${trimmedNumber}`,
            amenities: selectedAmenities,
        };
        onAddRoom(newRoom);
        setRoomNumber('');
        setRoomName('');
        setSelectedAmenities([]);
    };

    const handleAmenityToggle = (amenityName: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenityName)
                ? prev.filter(a => a !== amenityName)
                : [...prev, amenityName]
        );
    };

    const isRoomActive = (roomNumber: string) => {
        return rooms.some(r => r.roomNumber === roomNumber);
    };
    
    const handleDeleteClick = (room: HotelRoom) => {
        if (isRoomActive(room.number)) {
            alert(`O Quarto ${room.number} está ocupado ou reservado e não pode ser removido.`);
            return;
        }
        setConfirmingDelete(room);
    }
    
    const handleConfirmDelete = () => {
        if (confirmingDelete) {
            onRemoveRoom(confirmingDelete.number);
            setConfirmingDelete(null);
        }
    }

    const sortedInventory = [...inventory].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('checkRoom')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ArrowLeft size={16}/> Voltar para Quartos
                </button>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Gerenciar Inventário de Quartos</h2>
            </div>
            
            <form onSubmit={handleAddRoom} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 space-y-4">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Adicionar Novo Quarto</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="roomNumber" className="block text-sm font-medium mb-1">Número / Nome do Quarto</label>
                        <input type="text" id="roomNumber" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Ex: 101, Suíte Master"/>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-2">Comodidades</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {amenities.map(amenity => (
                             <label key={amenity.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md cursor-pointer">
                                <input type="checkbox" checked={selectedAmenities.includes(amenity.name)} onChange={() => handleAmenityToggle(amenity.name)} className="h-4 w-4 mr-2"/>
                                {amenity.name}
                            </label>
                        ))}
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="text-right pt-2">
                    <button type="submit" className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700">
                        <PlusCircle size={18} /> Adicionar Quarto
                    </button>
                </div>
            </form>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Quartos Cadastrados</h3>
                {sortedInventory.length > 0 ? (
                    <ul className="space-y-2">
                        {sortedInventory.map(room => (
                            <li key={room.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                        {room.name}
                                        {room.name !== room.number && <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> ({room.number})</span>}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">{room.amenities.join(', ') || 'Sem comodidades'}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteClick(room)}
                                    disabled={isRoomActive(room.number)}
                                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    title={isRoomActive(room.number) ? "Quarto em uso" : "Remover quarto"}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-4">Nenhum quarto cadastrado no inventário.</p>
                )}
            </div>

            {confirmingDelete && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm space-y-4">
                        <div className="text-center">
                            <AlertTriangle size={40} className="mx-auto text-yellow-500" />
                            <h3 className="text-xl font-bold mt-2">Confirmar Exclusão</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-center">
                            Tem certeza que deseja remover o <span className="font-bold">{confirmingDelete.name}</span> do inventário? Esta ação é permanente.
                        </p>
                        <div className="flex justify-center gap-3 pt-2">
                            <button onClick={() => setConfirmingDelete(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">Cancelar</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRooms;