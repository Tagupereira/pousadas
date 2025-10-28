import React, { useMemo, useState } from 'react';
import type { Room, Product, ClosedRoom } from '../types';
import { ArrowLeft, CheckCircle, Printer, Users, PlusCircle, Trash2, CreditCard, Pizza, Banknote } from 'lucide-react';

interface CheckoutProps {
  room: Room;
  onConfirmCheckout: (record: ClosedRoom) => void;
  onCancel: () => void;
  products: Product[];
}

type PaymentMethod = 'Dinheiro' | 'Cartão' | 'PIX';

interface Payment {
    id: string;
    method: PaymentMethod;
    amount: number;
}

const Checkout: React.FC<CheckoutProps> = ({ room, onConfirmCheckout, onCancel, products }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Dinheiro');
    const [splitCount, setSplitCount] = useState<number | ''>(1);

    const {
        nights,
        roomTotal,
        mealPackageTotal,
        orderTotal,
        packageTotal,
        totalAmount
    } = useMemo(() => {
        const checkIn = new Date(room.checkInDate);
        const checkOut = new Date();
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        const diffTime = Math.max(checkOut.getTime() - checkIn.getTime(), 0);
        const calculatedNights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

        const mealPrices = {
            breakfast: products.find(p => p.id === 'meal_breakfast')?.price || 0,
            lunch: products.find(p => p.id === 'meal_lunch')?.price || 0,
            dinner: products.find(p => p.id === 'meal_dinner')?.price || 0,
        };
        const dailyMealCost =
            (room.mealPackage.breakfast ? mealPrices.breakfast : 0) +
            (room.mealPackage.lunch ? mealPrices.lunch : 0) +
            (room.mealPackage.dinner ? mealPrices.dinner : 0);

        const calculatedMealPackageTotal = dailyMealCost * calculatedNights;
        const calculatedRoomTotal = room.dailyRate * calculatedNights;
        const calculatedOrderTotal = room.order.reduce((acc, item) => acc + item.productPrice * item.quantity, 0);
        const calculatedPackageTotal = room.packagePrice || 0;
        const calculatedTotalAmount = calculatedRoomTotal + calculatedOrderTotal + calculatedMealPackageTotal + calculatedPackageTotal;

        return {
            nights: calculatedNights,
            roomTotal: calculatedRoomTotal,
            mealPackageTotal: calculatedMealPackageTotal,
            orderTotal: calculatedOrderTotal,
            packageTotal: calculatedPackageTotal,
            totalAmount: calculatedTotalAmount,
        };
    }, [room, products]);

    const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
    const remainingAmount = totalAmount - totalPaid;
    const change = totalPaid > totalAmount ? totalPaid - totalAmount : 0;
    const isFullyPaid = remainingAmount <= 0;

    const handleAddPayment = () => {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        const newPayment: Payment = {
            id: `pay_${Date.now()}`,
            method: paymentMethod,
            amount,
        };
        setPayments(prev => [...prev, newPayment]);
        setPaymentAmount('');
    };
    
    const handleRemovePayment = (id: string) => {
        setPayments(prev => prev.filter(p => p.id !== id));
    };

    const handleConfirm = () => {
        const closedRoomRecord: ClosedRoom = {
            ...room,
            finalCheckOutDate: new Date().toISOString(),
            roomTotal,
            orderTotal,
            mealPackageTotal,
            totalAmount,
            originalStatus: room.status,
        };
        onConfirmCheckout(closedRoomRecord);
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/D';
    
    const paymentInputDisabled = isFullyPaid && paymentMethod !== 'Dinheiro';

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ArrowLeft size={16} /> Voltar
                </button>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Fechamento da Conta</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-2xl mx-auto space-y-6">
                {/* Resumo */}
                <div>
                    <h3 className="text-xl font-bold mb-2">Resumo da Conta</h3>
                     <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Hospedagem ({nights} x {formatCurrency(room.dailyRate)})</span> <span>{formatCurrency(roomTotal)}</span></div>
                        <div className="flex justify-between"><span>Pacotes de Refeição</span> <span>{formatCurrency(mealPackageTotal)}</span></div>
                        {packageTotal > 0 && <div className="flex justify-between"><span>Pacote Adicional ({room.packageName})</span> <span>{formatCurrency(packageTotal)}</span></div>}
                        <div className="flex justify-between"><span>Consumo / Serviços</span> <span>{formatCurrency(orderTotal)}</span></div>
                    </div>
                    <div className="flex justify-between font-bold text-xl mt-2 pt-2 border-t dark:border-gray-600">
                        <span>TOTAL A PAGAR:</span>
                        <span>{formatCurrency(totalAmount)}</span>
                    </div>
                </div>

                {/* Dividir Conta */}
                 <div className="border-t dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-bold mb-2">Dividir a Conta</h3>
                    <div className="flex items-center gap-4">
                        <label htmlFor="splitCount" className="flex items-center gap-2"><Users size={16}/> Dividir por:</label>
                        <input
                            type="number" id="splitCount"
                            value={splitCount}
                            onChange={(e) => setSplitCount(parseInt(e.target.value, 10) || '')}
                            min="1"
                            className="w-20 p-2 text-center bg-gray-50 dark:bg-gray-700 border rounded-md"
                        />
                        <span>pessoas</span>
                        {splitCount && splitCount > 1 && (
                            <div className="text-right flex-1 font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(totalAmount / splitCount)} por pessoa
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagamentos */}
                <div className="border-t dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-bold mb-2">Pagamentos</h3>
                     <div className="space-y-4">
                         {/* Input de pagamento */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Valor" disabled={paymentInputDisabled} className="p-2 bg-gray-50 dark:bg-gray-700 border rounded-md disabled:opacity-50" />
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="p-2 bg-gray-50 dark:bg-gray-700 border rounded-md">
                                <option>Dinheiro</option>
                                <option>Cartão</option>
                                <option>PIX</option>
                            </select>
                            <button onClick={handleAddPayment} disabled={paymentInputDisabled} className="flex items-center justify-center gap-2 p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <PlusCircle size={16} /> Adicionar
                            </button>
                        </div>
                        {/* Lista de pagamentos */}
                        <div className="space-y-2">
                            {payments.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    <div className="flex items-center gap-2">
                                        {p.method === 'Dinheiro' && <Banknote size={16} />}
                                        {p.method === 'Cartão' && <CreditCard size={16} />}
                                        {p.method === 'PIX' && <Pizza size={16} />} {/* Placeholder for Pix */}
                                        <span>{p.method}</span>
                                    </div>
                                    <span>{formatCurrency(p.amount)}</span>
                                    <button onClick={() => handleRemovePayment(p.id)} className="text-red-500"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                        {/* Resumo Pagamentos */}
                        <div className="pt-2 space-y-1 text-sm">
                             <div className="flex justify-between font-semibold"><p>Total Pago:</p> <p>{formatCurrency(totalPaid)}</p></div>
                             {remainingAmount > 0 && <div className="flex justify-between text-red-500 font-semibold"><p>Valor Restante:</p> <p>{formatCurrency(remainingAmount)}</p></div>}
                             {change > 0 && <div className="flex justify-between text-green-500 font-semibold"><p>Troco:</p> <p>{formatCurrency(change)}</p></div>}
                        </div>
                    </div>
                </div>
                
                {/* Botão Finalizar */}
                <div className="pt-4">
                     <button onClick={handleConfirm} disabled={!isFullyPaid} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <CheckCircle size={18} /> Finalizar Estadia
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
