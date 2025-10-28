import React, { useState, useMemo } from 'react';
import type { Room, HotelRoom, View } from '../types';
import { Bed, User, Wrench, PlusCircle, Check, Clock } from 'lucide-react';

interface CheckRoomProps {
    rooms: Room[];
    inventory: HotelRoom[];
    setView: (view: View) => void;
    onSelectRoom: (room: Room) => void;
    onStartCheckIn: (room: HotelRoom) => void;
}

const CheckRoom: React.FC<CheckRoomProps> = ({ rooms, inventory, setView, onSelectRoom, onStartCheckIn }) => {
    const [filter, setFilter] = useState<'all' | 'occupied' | 'reserved' | 'available'>('all');

    const allRooms = useMemo(() => {
        const occupiedRoomNumbers = new Set(rooms.map(r => r.roomNumber));
        const availableRooms = inventory
            .filter(invRoom => !occupiedRoomNumbers.has(invRoom.number))
            .map(invRoom => ({ ...invRoom, status: 'available' as const }));

        // Combine and sort
        return [...rooms, ...availableRooms]
            .sort((a, b) => {
                const numA = 'roomNumber' in a ? a.roomNumber : a.number;
                const numB = 'roomNumber' in b ? b.roomNumber : b.number;
                return numA.localeCompare(numB, undefined, { numeric: true });
            });

    }, [rooms, inventory]);

    const filteredRooms = useMemo(() => {
        if (filter === 'all') return allRooms;
        return allRooms.filter(room => room.status === filter);
    }, [allRooms, filter]);

    const getStatusInfo = (status: 'occupied' | 'reserved' | 'available') => {
        switch (status) {
            case 'occupied': return { text: 'Ocupado', color: 'bg-red-500', icon: <Bed size={14} /> };
            case 'reserved': return { text: 'Reservado', color: 'bg-yellow-500', icon: <Clock size={14} /> };
            case 'available': return { text: 'Disponível', color: 'bg-green-500', icon: <Check size={14} /> };
            default: return { text: '', color: 'bg-gray-500', icon: null };
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Situação dos Quartos</h2>
                <button
                    onClick={() => setView('manageRooms')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700"
                >
                    <Wrench size={16} /> Gerenciar Inventário
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setFilter('all')} className={`px-4 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Todos</button>
                <button onClick={() => setFilter('available')} className={`px-4 py-1 rounded-full text-sm ${filter === 'available' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Disponíveis</button>
                <button onClick={() => setFilter('occupied')} className={`px-4 py-1 rounded-full text-sm ${filter === 'occupied' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Ocupados</button>
                <button onClick={() => setFilter('reserved')} className={`px-4 py-1 rounded-full text-sm ${filter === 'reserved' ? 'bg-yellow-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Reservados</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredRooms.map(room => {
                    const statusInfo = getStatusInfo(room.status);
                    const isAvailable = room.status === 'available';
                    
                    const roomName = 'roomName' in room ? room.roomName : room.name;
                    const guestName = 'guestName' in room ? room.guestName : '';

                    return (
                        <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
                            <div className="p-4 flex-grow">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-lg">{roomName}</h3>
                                    <span className={`px-2 py-0.5 text-xs font-semibold text-white ${statusInfo.color} rounded-full flex items-center gap-1`}>
                                        {statusInfo.icon}
                                        {statusInfo.text}
                                    </span>
                                </div>
                                {!isAvailable ? (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p className="flex items-center gap-2"><User size={14} />{guestName}</p>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <p>Pronto para check-in.</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3">
                                {isAvailable ? (
                                    <button
                                        onClick={() => onStartCheckIn(room as HotelRoom)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <PlusCircle size={16} /> Fazer Check-in / Reserva
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onSelectRoom(room as Room)}
                                        className="w-full text-center px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                    >
                                        Ver Detalhes
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {filteredRooms.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <Bed size={48} className="mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-500">Nenhum quarto encontrado com o filtro selecionado.</p>
                </div>
            )}
        </div>
    );
};

export default CheckRoom;
