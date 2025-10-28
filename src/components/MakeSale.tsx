import React, { useState } from 'react';
// FIX: Removed .ts extension from import paths.
import useLocalStorage from '../hooks/useLocalStorage';
import type { Room, Product, OrderItem } from '../types';

const MakeSale: React.FC = () => {
    const [rooms, setRooms] = useLocalStorage<Room[]>('rooms', []);
    const [products] = useLocalStorage<Product[]>('products', []);
    
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const occupiedRooms = rooms.filter(room => room.status === 'occupied');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedRoom || !selectedProduct || !quantity || quantity <= 0) {
            setError('Por favor, selecione um quarto, um produto e uma quantidade válida.');
            return;
        }

        const product = products.find(p => p.id === selectedProduct);
        if (!product) {
            setError('Produto selecionado não encontrado.');
            return;
        }

        // FIX: The 'date' property does not exist on the OrderItem type. It has been removed.
        const newOrderItem: OrderItem = {
            id: Date.now().toString(),
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            quantity,
        };

        setRooms(prevRooms => 
            prevRooms.map(room => 
                room.id === selectedRoom ? { ...room, order: [...room.order, newOrderItem] } : room
            )
        );
        
        const room = rooms.find(r => r.id === selectedRoom);
        setSuccess(`Venda de ${quantity}x ${product.name} para o quarto ${room?.roomNumber} registrada!`);
        
        setSelectedProduct('');
        setQuantity(1);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Realizar Venda</h2>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quarto (Ocupados)</label>
                        <select
                            id="room"
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Selecione um quarto</option>
                            {occupiedRooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    Quarto {room.roomNumber} ({room.guestName})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produto</label>
                        <select
                            id="product"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Selecione um produto</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name} - R$ {product.price.toFixed(2)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            required
                        />
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <div className="pt-4 text-right">
                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-transform transform hover:scale-105">
                        Adicionar à Comanda
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MakeSale;