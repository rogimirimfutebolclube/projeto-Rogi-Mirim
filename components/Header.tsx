
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const RogiMirimLogo = () => (
    <img src="https://i.ibb.co/jZ8qXzP/logo.png" alt="Projeto Rogi Mirim Logo" className="h-20 w-auto" />
);

interface HeaderProps {
    isSyncing?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSyncing }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const linkStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
    const activeLinkStyle = "bg-blue-600 text-white";
    const inactiveLinkStyle = "text-gray-300 hover:bg-gray-700 hover:text-white";

    const mobileLinkStyle = "block px-3 py-2 rounded-md text-base font-medium";
    const activeMobileLinkStyle = "bg-blue-600 text-white";
    const inactiveMobileLinkStyle = "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    <div className="flex-shrink-0 flex items-center">
                       <RogiMirimLogo />
                       <div className="flex flex-col ml-4">
                           <span className="text-xl sm:text-2xl font-bold text-yellow-400">Projeto Rogi Mirim</span>
                           <div className="flex items-center mt-1">
                               <div className={`h-2 w-2 rounded-full mr-2 ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                               <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                   {isSyncing ? 'Sincronizando Nuvem...' : 'Dados Sincronizados'}
                               </span>
                           </div>
                       </div>
                    </div>
                    {/* Desktop Menu */}
                    <div className="hidden lg:block">
                        <div className="ml-10 flex items-baseline space-x-2">
                            <NavLink to="/" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                                Inscrição
                            </NavLink>
                            <NavLink to="/lista-de-chamada" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                                Chamada
                            </NavLink>
                            <NavLink to="/horarios" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                                Horários
                            </NavLink>
                             <NavLink to="/atletas" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                                Atletas
                            </NavLink>
                        </div>
                    </div>
                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </nav>
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden bg-gray-800 border-t border-gray-700" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${mobileLinkStyle} ${isActive ? activeMobileLinkStyle : inactiveMobileLinkStyle}`}>
                            Inscrição
                        </NavLink>
                        <NavLink to="/lista-de-chamada" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${mobileLinkStyle} ${isActive ? activeMobileLinkStyle : inactiveMobileLinkStyle}`}>
                            Chamada
                        </NavLink>
                        <NavLink to="/horarios" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${mobileLinkStyle} ${isActive ? activeMobileLinkStyle : inactiveMobileLinkStyle}`}>
                            Horários
                        </NavLink>
                        <NavLink to="/atletas" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${mobileLinkStyle} ${isActive ? activeMobileLinkStyle : inactiveMobileLinkStyle}`}>
                            Atletas
                        </NavLink>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
