import React, { useState, useMemo } from 'react';
import type { Room, Product, OrderItem, Amenity, View } from '../types';
import { ArrowLeft, Edit, Plus, Minus, Trash2, Utensils, AlertTriangle, CheckSquare, Clock } from 'lucide-react';

interface RoomDetailProps {
    room: Room;
    setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
    products: Product[];
    setView: (view: View) => void;
    setRoomToCheckout: (room: Room | null) => void;
    amenities: Amenity[];
}

const RoomDetail: React.FC<RoomDetailProps> = ({ room, setRooms, products, setView, setRoomToCheckout, amenities }) => {
    const [viewMode, setViewMode] = useState<'summary' | 'order'>('summary');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(room);
    const [confirmingAddItem, setConfirmingAddItem] = useState<Product | null>(null);
    const [confirmingCancel, setConfirmingCancel] = useState(false);

    // This effect ensures the edit form data is fresh if the user navigates away and back
    React.useEffect(() => {
        setEditData(room);
    }, [room]);
    
    const nightsSoFar = useMemo(() => {
        const checkIn = new Date(room.checkInDate);
        const today = new Date();
        checkIn.setUTCHours(0, 0, 0, 0);
        today.setUTCHours(0, 0, 0, 0);
        const diffTime = Math.max(today.getTime() - checkIn.getTime(), 0);
        return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
    }, [room.checkInDate]);

    const mealPrices = useMemo(() => ({
        breakfast: products.find(p => p.id === 'meal_breakfast')?.price || 0,
        lunch: products.find(p => p.id === 'meal_lunch')?.price || 0,
        dinner: products.find(p => p.id === 'meal_dinner')?.price || 0,
    }), [products]);

    const dailyMealCost = (room.mealPackage.breakfast ? mealPrices.breakfast : 0) +
        (room.mealPackage.lunch ? mealPrices.lunch : 0) +
        (room.mealPackage.dinner ? mealPrices.dinner : 0);

    const mealPackageTotalSoFar = dailyMealCost * nightsSoFar;
    const roomTotalSoFar = room.dailyRate * nightsSoFar;
    const orderTotal = room.order.reduce((acc, item) => acc + item.productPrice * item.quantity, 0);
    const packageTotal = room.packagePrice || 0;
    const grandTotalSoFar = roomTotalSoFar + orderTotal + mealPackageTotalSoFar + packageTotal;

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/D';

    const handleUpdateRooms = (updatedRoom: Room) => {
        setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    };

    const handleAddItem = (product: Product) => {
        const isMealItemInPackage = (
            (product.id === 'meal_breakfast' && room.mealPackage.breakfast) ||
            (product.id === 'meal_lunch' && room.mealPackage.lunch) ||
            (product.id === 'meal_dinner' && room.mealPackage.dinner)
        );
        if (isMealItemInPackage) {
            setConfirmingAddItem(product);
            return;
        }
        confirmAddItem(product);
    };
    
    const confirmAddItem = (product: Product) => {
        setRooms(prevRooms => prevRooms.map(r => {
            if (r.id !== room.id) return r;
            const existingItem = r.order.find(item => item.productId === product.id);
            if (existingItem) {
                return { ...r, order: r.order.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
            } else {
                const newItem: OrderItem = {
                    id: `order_${Date.now()}`,
                    productId: product.id,
                    productName: product.name,
                    productPrice: product.price,
                    quantity: 1
                };
                return { ...r, order: [...r.order, newItem] };
            }
        }));
        setConfirmingAddItem(null);
    };

    const handleQuantityChange = (productId: string, delta: number) => {
        setRooms(prevRooms => prevRooms.map(r => {
            if (r.id !== room.id) return r;
            const newOrder = r.order.map(item =>
                item.productId === productId
                    ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                    : item
            ).filter(item => item.quantity > 0);
            return { ...r, order: newOrder };
        }));
    };
    
    const openEditModal = () => {
        // Crucially, reset editData to the CURRENT room state when opening
        setEditData(room);
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        handleUpdateRooms(editData);
        setIsEditing(false);
    };
    
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEditMealPackageChange = (meal: keyof Room['mealPackage']) => {
        setEditData(prev => ({
            ...prev,
            mealPackage: { ...prev.mealPackage, [meal]: !prev.mealPackage[meal] }
        }));
    };

    const handleEditAmenityChange = (amenityName: string) => {
        setEditData(prev => {
            const newAmenities = prev.amenities.includes(amenityName)
                ? prev.amenities.filter(a => a !== amenityName)
                : [...prev.amenities, amenityName];
            return { ...prev, amenities: newAmenities };
        });
    };

    const handleConfirmCheckin = () => {
        handleUpdateRooms({ ...room, status: 'occupied' });
    };

    const handleCancelReservation = () => {
        setRooms(prev => prev.filter(r => r.id !== room.id));
        setView('checkRoom');
    };

    // Reserved Room View
    if (room.status === 'reserved') {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('checkRoom')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                        <ArrowLeft size={16} /> Voltar
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-lg mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-2">Reserva para Quarto {room.roomNumber}</h2>
                    <p className="text-lg mb-4">Hóspede: <span className="font-semibold">{room.guestName}</span></p>
                    <p className="mb-6">Check-in agendado para: <span className="font-semibold">{formatDate(room.checkInDate)}</span></p>
                    <div className="flex justify-center gap-4">
                        <button onClick={handleConfirmCheckin} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 flex items-center gap-2">
                           <CheckSquare size={18}/> Confirmar Check-in
                        </button>
                        <button onClick={() => setConfirmingCancel(true)} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700">
                            Cancelar Reserva
                        </button>
                    </div>
                </div>
                {confirmingCancel && (
                     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
                             <AlertTriangle size={48} className="mx-auto text-yellow-500" />
                            <h3 className="text-xl font-bold">Confirmar Cancelamento</h3>
                            <p className="text-gray-600 dark:text-gray-300">Tem certeza que deseja cancelar esta reserva?</p>
                            <div className="flex justify-center gap-3 pt-2">
                                <button onClick={() => setConfirmingCancel(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">Não</button>
                                <button onClick={handleCancelReservation} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">Sim, Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    // Main View for Occupied Room
    return (
        <div className="animate-fade-in">
             <div className="flex items-center gap-4 mb-6">
                <button onClick={() => viewMode === 'order' ? setViewMode('summary') : setView('checkRoom')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ArrowLeft size={16} /> {viewMode === 'order' ? "Voltar ao Resumo" : "Voltar para Quartos"}
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold">Quarto {room.roomNumber} - {room.roomName}</h2>
                <p>Hóspede: <span className="font-semibold">{room.guestName}</span></p>
            </div>

            {viewMode === 'summary' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold mb-4">Extrato da Conta (Parcial)</h3>
                        <button onClick={openEditModal} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            <Edit size={14} /> Alterar Estadia
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
                       <div>
                           <h4 className="font-bold mb-2 text-lg">Detalhes da Hospedagem</h4>
                           <p><strong>Período:</strong> {formatDate(room.checkInDate)} a {formatDate(room.checkOutDate)}</p>
                           <p><strong>Diárias (até hoje):</strong> {nightsSoFar} x {formatCurrency(room.dailyRate)}</p>
                           {room.amenities.length > 0 && <p><strong>Comodidades:</strong> {room.amenities.join(', ')}</p>}
                           
                           <h4 className="font-bold mt-4 mb-2 text-lg">Pacotes Inclusos</h4>
                           <ul className="list-disc list-inside">
                               {room.mealPackage.breakfast && <li>Café da Manhã</li>}
                               {room.mealPackage.lunch && <li>Almoço</li>}
                               {room.mealPackage.dinner && <li>Jantar</li>}
                               {room.packageName && <li><strong>Pacote Adicional:</strong> {room.packageName}</li>}
                               {!room.mealPackage.breakfast && !room.mealPackage.lunch && !room.mealPackage.dinner && !room.packageName && <li>Nenhum pacote incluso.</li>}
                           </ul>
                       </div>
                       <div>
                           <h4 className="font-bold mb-2 text-lg">Resumo Financeiro</h4>
                           <div className="space-y-1">
                               <div className="flex justify-between"><span>Total Diárias (Parcial):</span> <span>{formatCurrency(roomTotalSoFar)}</span></div>
                               <div className="flex justify-between"><span>Total Pacotes (Parcial):</span> <span>{formatCurrency(mealPackageTotalSoFar)}</span></div>
                               {packageTotal > 0 && <div className="flex justify-between"><span>Pacote Adicional:</span> <span>{formatCurrency(packageTotal)}</span></div>}
                               <div className="flex justify-between"><span>Total Consumo:</span> <span>{formatCurrency(orderTotal)}</span></div>
                               <hr className="my-2 border-gray-200 dark:border-gray-600"/>
                               <div className="flex justify-between font-bold text-xl"><p>TOTAL PARCIAL:</p> <p>{formatCurrency(grandTotalSoFar)}</p></div>
                           </div>
                       </div>
                    </div>
                    <div className="mt-6 flex flex-col md:flex-row gap-4">
                        <button onClick={() => setViewMode('order')} className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700">Abrir Comanda / Adicionar Consumo</button>
                        <button onClick={() => { setRoomToCheckout(room); setView('checkout'); }} className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700">Ir para Pagamento (Check-out)</button>
                    </div>
                </div>
            )}
            
            {viewMode === 'order' && (
                 <div className="animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map(product => (
                                    <button key={product.id} onClick={() => handleAddItem(product)} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow text-center hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors">
                                        <p className="font-semibold text-gray-900 dark:text-gray-200">{product.name}</p>
                                        <p className="text-sm text-blue-600">{formatCurrency(product.price)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                            <h3 className="text-xl font-bold mb-4">Comanda</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                               {room.order.length > 0 ? room.order.map(item => (
                                   <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                       <div>
                                           <p className="text-sm font-semibold">{item.productName}</p>
                                           <p className="text-xs text-gray-500">{formatCurrency(item.productPrice)}</p>
                                       </div>
                                       <div className="flex items-center gap-2">
                                           <button onClick={() => handleQuantityChange(item.productId, -1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600"><Minus size={12} /></button>
                                           <span>{item.quantity}</span>
                                           <button onClick={() => handleQuantityChange(item.productId, 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600"><Plus size={12} /></button>
                                           <button onClick={() => handleQuantityChange(item.productId, -item.quantity)} className="p-1 text-red-500"><Trash2 size={14} /></button>
                                       </div>
                                   </div>
                               )) : (
                                    <div className="text-center py-10 text-gray-500">
                                       <Utensils size={32} className="mx-auto" />
                                       <p className="mt-2 text-sm">A comanda está vazia.</p>
                                   </div>
                               )}
                            </div>
                             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Consumo:</span>
                                    <span>{formatCurrency(orderTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Modal */}
             {isEditing && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl space-y-4">
                        <h3 className="text-2xl font-bold">Alterar Estadia</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome do Hóspede</label>
                                <input type="text" name="guestName" value={editData.guestName} onChange={handleEditInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Valor da Diária</label>
                                <input type="number" name="dailyRate" value={editData.dailyRate} onChange={e => setEditData(p => ({ ...p, dailyRate: parseFloat(e.target.value) || 0 }))} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Check-in</label>
                                <input type="date" value={editData.checkInDate.split('T')[0]} onChange={e => setEditData(p => ({ ...p, checkInDate: new Date(e.target.value + 'T00:00:00Z').toISOString() }))} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Check-out</label>
                                <input type="date" value={editData.checkOutDate?.split('T')[0] ?? ''} onChange={e => setEditData(p => ({ ...p, checkOutDate: e.target.value ? new Date(e.target.value + 'T00:00:00Z').toISOString() : null }))} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Pacotes de Refeição</label>
                            <div className="flex gap-4">
                               <label><input type="checkbox" checked={editData.mealPackage.breakfast} onChange={() => handleEditMealPackageChange('breakfast')} className="mr-1"/> Café da Manhã</label>
                               <label><input type="checkbox" checked={editData.mealPackage.lunch} onChange={() => handleEditMealPackageChange('lunch')} className="mr-1"/> Almoço</label>
                               <label><input type="checkbox" checked={editData.mealPackage.dinner} onChange={() => handleEditMealPackageChange('dinner')} className="mr-1"/> Jantar</label>
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-2">Comodidades</label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {amenities.map(amenity => (
                                    <label key={amenity.id}><input type="checkbox" checked={editData.amenities.includes(amenity.name)} onChange={() => handleEditAmenityChange(amenity.name)} className="mr-1"/> {amenity.name}</label>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">Cancelar</button>
                            <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Modal for adding meal item */}
             {confirmingAddItem && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Atenção</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Este item já está incluso no pacote de refeições do hóspede. Deseja adicioná-lo como um consumo extra?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setConfirmingAddItem(null)} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">Cancelar</button>
                            <button onClick={() => confirmAddItem(confirmingAddItem)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">Adicionar Mesmo Assim</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomDetail;
