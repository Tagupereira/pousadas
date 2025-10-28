import React, { useState } from 'react';
import type { ClosedRoom, View, Room, HotelRoom } from '../types';
import { Trash2, Search, FileText, ArrowLeft, RotateCcw, AlertTriangle } from 'lucide-react';

interface HistoryProps {
    closedRooms: ClosedRoom[];
    setView: (view: View) => void;
    onReopenRoom: (record: ClosedRoom) => void;
    onClearHistory: () => void;
    rooms: Room[];
    inventory: HotelRoom[];
}

const History: React.FC<HistoryProps> = ({ closedRooms, setView, onReopenRoom, onClearHistory, rooms, inventory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmingReopen, setConfirmingReopen] = useState<ClosedRoom | null>(null);

    const activeRoomNumbers = new Set(rooms.map(r => r.roomNumber));
    const inventoryRoomNumbers = new Set(inventory.map(r => r.number));

    const filteredHistory = closedRooms.filter(item =>
        item.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.roomNumber.includes(searchTerm)
    );

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/D';

    const handleClearHistory = () => {
        if (window.confirm("Tem certeza de que deseja limpar todo o histórico? Esta ação não pode ser desfeita.")) {
            onClearHistory();
        }
    };
    
    const handleConfirmReopen = () => {
        if (confirmingReopen) {
            onReopenRoom(confirmingReopen);
            setConfirmingReopen(null);
        }
    };


    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                     <button onClick={() => setView('home')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                        <ArrowLeft size={16}/> Voltar
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Histórico de Contas</h2>
                </div>
                {closedRooms.length > 0 && (
                    <button onClick={handleClearHistory} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700">
                        <Trash2 size={16} /> Limpar Histórico
                    </button>
                )}
            </div>

            <div className="mb-6 relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por hóspede ou quarto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
            </div>

            {filteredHistory.length > 0 ? (
                <div className="space-y-3">
                    {filteredHistory.map(item => {
                        const isRoomOccupied = activeRoomNumbers.has(item.roomNumber);
                        const isRoomInInventory = inventoryRoomNumbers.has(item.roomNumber);
                        const canReopen = !isRoomOccupied && isRoomInInventory;
                        
                        let reopenTooltip = "Reabrir esta conta";
                        if (isRoomOccupied) reopenTooltip = "Quarto está atualmente ocupado";
                        else if (!isRoomInInventory) reopenTooltip = "Quarto não existe mais no inventário";

                        return (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            >
                                <div>
                                    <p className="font-bold">Quarto {item.roomNumber} - {item.guestName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Check-out em: {formatDate(item.finalCheckOutDate)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(item.totalAmount)}</p>
                                </div>
                            </div>
                            {expandedId === item.id && (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 animate-fade-in space-y-4">
                                    <div>
                                        <h4 className="font-bold mb-2">Detalhes da Conta:</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                            <p>Check-in:</p><p className="text-right">{formatDate(item.checkInDate)}</p>
                                            <p>Check-out:</p><p className="text-right">{formatDate(item.finalCheckOutDate)}</p>
                                            <p>Total Hospedagem:</p><p className="text-right">{formatCurrency(item.roomTotal)}</p>
                                            <p>Total Refeições:</p><p className="text-right">{formatCurrency(item.mealPackageTotal)}</p>
                                            <p>Total Consumo:</p><p className="text-right">{formatCurrency(item.orderTotal)}</p>
                                            {(item.packagePrice ?? 0) > 0 && (
                                                <>
                                                <p>Pacote ({item.packageName}):</p><p className="text-right">{formatCurrency(item.packagePrice!)}</p>
                                                </>
                                            )}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between font-bold">
                                            <p>Valor Total Pago:</p>
                                            <p>{formatCurrency(item.totalAmount)}</p>
                                        </div>
                                    </div>
                                     <div>
                                        <button
                                            onClick={() => setConfirmingReopen(item)}
                                            disabled={!canReopen}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={reopenTooltip}
                                        >
                                            <RotateCcw size={14} /> Reabrir Conta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )})}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <FileText size={48} className="mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-500">
                        {closedRooms.length === 0 ? "Nenhuma conta foi fechada ainda." : "Nenhum resultado encontrado para sua busca."}
                    </p>
                </div>
            )}

            {confirmingReopen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm space-y-4 text-center">
                        <AlertTriangle size={48} className="mx-auto text-yellow-500" />
                        <h3 className="text-xl font-bold mt-2">Confirmar Reabertura</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Tem certeza que deseja reabrir a conta para o <strong>Quarto {confirmingReopen.roomNumber} ({confirmingReopen.guestName})</strong>?
                            <br/>
                            A conta será movida de volta para a tela de quartos.
                        </p>
                        <div className="flex justify-center gap-3 pt-2">
                            <button onClick={() => setConfirmingReopen(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">Cancelar</button>
                            <button onClick={handleConfirmReopen} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Sim, Reabrir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;