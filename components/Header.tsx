
import React from 'react';
import { NavLink } from 'react-router-dom';

const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAaUAAAGlAQMAAAD+x8L/AAAAA1BMVEW1t7fkfS7mAAAAAXRSTlMAQObYZgAAAIJJREFUaN7twQENAAAAwiD7p7bHBwwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgA4Q4AAEBlS5ZAAAAAElFTkSuQmCC";

const RogiMirimLogo = () => (
    <img src="https://i.ibb.co/6P6X13p/logo.png" alt="Projeto Rogi Mirim Logo" className="h-20 w-auto" />
);

const Header: React.FC = () => {
    const linkStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
    const activeLinkStyle = "bg-blue-600 text-white";
    const inactiveLinkStyle = "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <header className="bg-gray-800 shadow-lg">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    <div className="flex-shrink-0 flex items-center">
                       <RogiMirimLogo />
                       <span className="text-2xl font-bold ml-4 text-yellow-400">Projeto Rogi Mirim</span>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <NavLink to="/" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                                Inscrição
                            </NavLink>
                            <NavLink to="/lista-de-chamada" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                                Lista de Chamada
                            </NavLink>
                            <NavLink to="/horarios" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                                Horários
                            </NavLink>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
