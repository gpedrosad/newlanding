import React from 'react';

interface BenefitProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
    
const Benefit: React.FC<BenefitProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start p-4">
      {/* Ícono */}
      <div className="text-blue-500 text-4xl mb-4 md:mb-0 md:mr-4">
        {icon}
      </div>

      {/* Contenido */}
      <div className="text-center md:text-left">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
};

export default Benefit;