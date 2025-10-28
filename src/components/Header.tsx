import React, { useState } from 'react';
import { Home, Bed, ShoppingCart, History, BarChart2, Star, Gift, Menu, X, Sun, Moon } from 'lucide-react';
import type { View } from '../types';

interface HeaderProps {
    setView: (view: View) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const Header: React.FC<HeaderProps> = ({ setView, theme, setTheme }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavigate = (view: View) => {
        setView(view);
        setMobileMenuOpen(false);
    }

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }

    const navLinks: { view: View; icon: React.ReactElement; text: string }[] = [
        { view: 'home', icon: <Home size={20} />, text: 'Início' },
        { view: 'checkRoom', icon: <Bed size={20} />, text: 'Quartos' },
        { view: 'registerProduct', icon: <ShoppingCart size={20} />, text: 'Produtos' },
        { view: 'manageAmenities', icon: <Star size={20} />, text: 'Comodidades' },
        { view: 'managePackages', icon: <Gift size={20} />, text: 'Pacotes' },
        { view: 'history', icon: <History size={20} />, text: 'Histórico' },
        { view: 'simulator', icon: <BarChart2 size={20} />, text: 'Simulador' },
    ];

    const NavLink: React.FC<{ link: typeof navLinks[0] }> = ({ link }) => (
        <button onClick={() => handleNavigate(link.view)} className="flex items-center w-full px-4 py-2 text-left text-base font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {/* FIX: Replaced React.cloneElement with React.createElement to avoid TypeScript type error. */}
            {React.createElement(link.icon.type, { ...link.icon.props, className: 'mr-3' })}
            {link.text}
        </button>
    );

    const menuContent = (
        <>
            <div className="p-4">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">HostManager</h1>
            </div>
            <nav className="flex-grow p-4 space-y-2">
                {navLinks.map(link => <NavLink key={link.view} link={link} />)}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={toggleTheme} className="flex items-center w-full px-4 py-2 text-left text-base font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {theme === 'light' ? <Moon className="mr-3" size={20} /> : <Sun className="mr-3" size={20} />}
                    {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">HostManager</h1>
                <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Menu (Overlay) */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-gray-100 dark:bg-gray-900 z-30 flex flex-col animate-fade-in">
                    {menuContent}
                </div>
            )}
            
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg h-screen fixed">
                {menuContent}
            </aside>
            <div className="hidden md:block w-64 flex-shrink-0"></div> {/* Spacer for fixed sidebar */}
        </>
    );
};

export default Header;
