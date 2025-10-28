import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import type { View, Product, Amenity, PackageService, Package, HotelRoom, Room, ClosedRoom } from './types';

// Import all components
import Header from './components/Header';
import Home from './components/Home';
import CheckRoom from './components/CheckRoom';
import RegisterRoom from './components/RegisterRoom';
import RoomDetail from './components/RoomDetail';
import Checkout from './components/Checkout';
import ManageRooms from './components/ManageRooms';
import RegisterProduct from './components/RegisterProduct';
import History from './components/History';
import Simulator from './components/Simulator';
import ManageAmenities from './components/ManageAmenities';
import ManagePackages from './components/ManagePackages';

function App() {
  const [view, setView] = useState<View>('home');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  // Local storage states
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [amenities, setAmenities] = useLocalStorage<Amenity[]>('amenities', []);
  const [packageServices, setPackageServices] = useLocalStorage<PackageService[]>('packageServices', []);
  const [packages, setPackages] = useLocalStorage<Package[]>('packages', []);
  const [inventory, setInventory] = useLocalStorage<HotelRoom[]>('inventory', []);
  const [rooms, setRooms] = useLocalStorage<Room[]>('rooms', []);
  const [closedRooms, setClosedRooms] = useLocalStorage<ClosedRoom[]>('closedRooms', []);
  
  // Transient state for flow control
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomToCheckIn, setRoomToCheckIn] = useState<HotelRoom | null>(null);
  const [roomToCheckout, setRoomToCheckout] = useState<Room | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Ensure default meal products exist
  useEffect(() => {
    const defaultMealProducts = [
        { id: 'meal_breakfast', name: 'Café da Manhã (Diária)', price: 30 },
        { id: 'meal_lunch', name: 'Almoço (Diária)', price: 50 },
        { id: 'meal_dinner', name: 'Jantar (Diária)', price: 45 },
    ];
    setProducts(currentProducts => {
        const existingMealIds = new Set(currentProducts.map(p => p.id));
        const missingMeals = defaultMealProducts.filter(dp => !existingMealIds.has(dp.id));
        return missingMeals.length > 0 ? [...currentProducts, ...missingMeals] : currentProducts;
    });
  }, [setProducts]);

  const handleNavigate = (newView: View) => setView(newView);

  const handleStartCheckIn = (room: HotelRoom) => {
    setRoomToCheckIn(room);
    setView('registerRoom');
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoomId(room.id);
    setView('roomDetail');
  };

  const handleStartCheckout = (room: Room) => {
    setRoomToCheckout(room);
    setView('checkout');
  }

  const handleConfirmCheckout = (record: ClosedRoom) => {
    setClosedRooms(prev => [record, ...prev].sort((a,b) => new Date(b.finalCheckOutDate).getTime() - new Date(a.finalCheckOutDate).getTime()));
    setRooms(prev => prev.filter(r => r.id !== record.id));
    setRoomToCheckout(null);
    setSelectedRoomId(null);
    setView('history');
  };

  const handleClearHistory = useCallback(() => {
    setClosedRooms([]);
  }, [setClosedRooms]);
  
  const addInventoryRoom = useCallback((newRoom: HotelRoom) => {
      setInventory(prevInventory => [...prevInventory, newRoom]);
  }, [setInventory]);

  const removeInventoryRoom = useCallback((roomNumberToRemove: string) => {
      setInventory(prevInventory => prevInventory.filter(r => r.number !== roomNumberToRemove));
  }, [setInventory]);
  
  const handleReopenRoom = (record: ClosedRoom) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { finalCheckOutDate, roomTotal, orderTotal, mealPackageTotal, totalAmount, originalStatus, ...reopenedRoomData } = record;
    const reopenedRoom: Room = { ...reopenedRoomData, status: originalStatus };

    setRooms(prev => [...prev, reopenedRoom]);
    setClosedRooms(prev => prev.filter(r => r.id !== record.id));
    setSelectedRoomId(reopenedRoom.id);
    setView('roomDetail');
  };

  const renderView = () => {
    const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;

    switch (view) {
      case 'home':
        return <Home setView={handleNavigate} />;
      case 'checkRoom':
        return <CheckRoom rooms={rooms} inventory={inventory} setView={handleNavigate} onSelectRoom={handleSelectRoom} onStartCheckIn={handleStartCheckIn} />;
      case 'registerRoom':
        if (!roomToCheckIn) {
            handleNavigate('checkRoom');
            return null;
        }
        return <RegisterRoom setView={handleNavigate} room={roomToCheckIn} setRooms={setRooms} packages={packages} />;
      case 'roomDetail':
         if (!selectedRoom) {
             handleNavigate('checkRoom');
             return null;
         }
         return <RoomDetail room={selectedRoom} setRooms={setRooms} products={products} setView={handleNavigate} setRoomToCheckout={handleStartCheckout} amenities={amenities} />;
      case 'checkout':
          if (!roomToCheckout) {
             handleNavigate('checkRoom');
             return null;
          }
          return <Checkout room={roomToCheckout} onConfirmCheckout={handleConfirmCheckout} onCancel={() => {
              const room = rooms.find(r => r.id === roomToCheckout.id);
              if (room) {
                  handleSelectRoom(room);
              } else {
                  handleNavigate('checkRoom');
              }
          }} products={products} />;
      case 'manageRooms':
        return <ManageRooms inventory={inventory} amenities={amenities} rooms={rooms} onAddRoom={addInventoryRoom} onRemoveRoom={removeInventoryRoom} setView={handleNavigate} />;
      case 'registerProduct':
        return <RegisterProduct products={products} setProducts={setProducts} />;
      case 'history':
        // FIX: Added the onClearHistory prop to the History component.
        return <History closedRooms={closedRooms} setView={handleNavigate} onReopenRoom={handleReopenRoom} onClearHistory={handleClearHistory} inventory={inventory} rooms={rooms} />;
      case 'simulator':
        return <Simulator products={products} />;
      case 'manageAmenities':
        return <ManageAmenities amenities={amenities} setAmenities={setAmenities} packageServices={packageServices} setPackageServices={setPackageServices} setView={handleNavigate}/>;
      case 'managePackages':
        return <ManagePackages packages={packages} setPackages={setPackages} packageServices={packageServices} />;
      default:
        return <Home setView={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Header setView={handleNavigate} theme={theme} setTheme={setTheme} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
