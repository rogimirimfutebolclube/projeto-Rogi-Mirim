
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 mt-12">
      <div className="container mx-auto py-4 px-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Projeto Rogi Mirim. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
