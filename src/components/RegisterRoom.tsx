import React, { useState, useMemo } from 'react';
import type { HotelRoom, Room, Package } from '../types';
import { ArrowLeft } from 'lucide-react';

interface RegisterRoomProps {
  setView: (view: 'checkRoom') => void;
  room: HotelRoom;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  packages: Package[];
}

const RegisterRoom: React.FC<RegisterRoomProps> = ({ setView, room, setRooms, packages }) => {
  const [guestName, setGuestName] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [checkInDateStr, setCheckInDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDateStr, setCheckOutDateStr] = useState('');
  const [mealPackage, setMealPackage] = useState({ breakfast: false, lunch: false, dinner: false });
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleMealChange = (meal: keyof typeof mealPackage) => {
    setMealPackage(prev => ({ ...prev, [meal]: !prev[meal] }));
  };

  const isMealDisabled = useMemo(() => {
    const check = {
        breakfast: room.amenities.includes('Café da Manhã'),
        lunch: room.amenities.includes('Almoço'),
        dinner: room.amenities.includes('Jantar'),
    };
    if (check.breakfast && !mealPackage.breakfast) setMealPackage(p => ({...p, breakfast: true}));
    if (check.lunch && !mealPackage.lunch) setMealPackage(p => ({...p, lunch: true}));
    if (check.dinner && !mealPackage.dinner) setMealPackage(p => ({...p, dinner: true}));
    return check;
  }, [room.amenities, mealPackage.breakfast, mealPackage.lunch, mealPackage.dinner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !dailyRate || !checkInDateStr) {
      setError('Por favor, preencha o nome do hóspede, valor da diária e data de check-in.');
      return;
    }

    const checkInDate = new Date(checkInDateStr + 'T00:00:00Z'); // Use UTC
    const selectedPackage = packages.find(p => p.id === selectedPackageId);

    const newRoom: Room = {
      id: `room_${Date.now()}`,
      roomNumber: room.number,
      roomName: room.name,
      guestName: guestName.trim(),
      dailyRate: parseFloat(dailyRate),
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDateStr ? new Date(checkOutDateStr + 'T00:00:00Z').toISOString() : null, // Use UTC
      order: [],
      status: 'reserved',
      amenities: room.amenities,
      mealPackage,
      packageId: selectedPackage?.id,
      packageName: selectedPackage?.name,
      packagePrice: selectedPackage?.price,
    };

    setRooms(prev => [...prev, newRoom]);
    setView('checkRoom');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setView('checkRoom')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
          <ArrowLeft size={16} /> Voltar
        </button>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Check-in / Reserva</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-2xl mx-auto space-y-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Quarto {room.number} - {room.name}</h3>
            {room.amenities.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{room.amenities.join(' • ')}</p>
            )}
        </div>
        
        {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}

        <div className="space-y-4">
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium mb-1">Nome do Hóspede</label>
            <input type="text" id="guestName" value={guestName} onChange={e => setGuestName(e.target.value)} required className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dailyRate" className="block text-sm font-medium mb-1">Valor da Diária (R$)</label>
              <input type="number" id="dailyRate" value={dailyRate} onChange={e => setDailyRate(e.target.value)} required min="0.01" step="0.01" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
            </div>
            <div>
              <label htmlFor="checkInDate" className="block text-sm font-medium mb-1">Data de Check-in</label>
              <input type="date" id="checkInDate" value={checkInDateStr} onChange={e => setCheckInDateStr(e.target.value)} required className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
            </div>
          </div>
          <div>
            <label htmlFor="checkOutDate" className="block text-sm font-medium mb-1">Data de Check-out (Opcional)</label>
            <input type="date" id="checkOutDate" value={checkOutDateStr} onChange={e => setCheckOutDateStr(e.target.value)} min={checkInDateStr} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium mb-2">Pacotes de Refeição (Diária)</label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
                <label className={`flex items-center cursor-pointer ${isMealDisabled.breakfast ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input type="checkbox" checked={mealPackage.breakfast} disabled={isMealDisabled.breakfast} onChange={() => handleMealChange('breakfast')} className="h-4 w-4 mr-2"/> Café da Manhã
                </label>
                <label className={`flex items-center cursor-pointer ${isMealDisabled.lunch ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input type="checkbox" checked={mealPackage.lunch} disabled={isMealDisabled.lunch} onChange={() => handleMealChange('lunch')} className="h-4 w-4 mr-2"/> Almoço
                </label>
                <label className={`flex items-center cursor-pointer ${isMealDisabled.dinner ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input type="checkbox" checked={mealPackage.dinner} disabled={isMealDisabled.dinner} onChange={() => handleMealChange('dinner')} className="h-4 w-4 mr-2"/> Jantar
                </label>
            </div>
        </div>
        
        <div>
            <label htmlFor="packageSelect" className="block text-sm font-medium mb-1">Pacote Adicional (Opcional)</label>
            <select
                id="packageSelect"
                value={selectedPackageId ?? ''}
                onChange={(e) => setSelectedPackageId(e.target.value || null)}
                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
                <option value="">Nenhum pacote</option>
                {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                        {pkg.name} (+{pkg.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </option>
                ))}
            </select>
        </div>


        <div className="text-right pt-4">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700">Confirmar</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterRoom;