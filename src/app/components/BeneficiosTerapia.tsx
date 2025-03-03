import React from 'react';
import { FaHeart, FaSmile, FaHandsHelping, FaBed } from 'react-icons/fa';
import Benefit from './Benefit';

const BeneficiosTerapia: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Beneficios de Terapia</h2>
      
      {/* Contenedor de Beneficios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        
        {/* Beneficio 1: Mejora emocional */}
        <Benefit
          icon={<FaHeart />}
          title="Mejora emocional"
          description="Recupera tu equilibrio emocional y comienza a disfrutar nuevamente de las cosas pequeñas de la vida, manejando mejor los desafíos emocionales."
        />
     
        {/* Beneficio 2: Mejora tu autoestima */}
        <Benefit
          icon={<FaSmile />}
          title="Mejora tu autoestima"
          description="Desarrolla una imagen más positiva de ti mismo al superar creencias negativas y trabajar en una mayor aceptación personal."
        />

        {/* Beneficio 3: Autocuidado y establecimiento de límites */}
        <Benefit
          icon={<FaHandsHelping />}
          title="Autocuidado y establecimiento de límites"
          description="Aprende a priorizar tu bienestar y a establecer límites saludables en tus relaciones y responsabilidades para mantener una vida equilibrada."
        />

        {/* Beneficio 4: Mejor descanso y sueño */}
        <Benefit
          icon={<FaBed />}
          title="Mejor descanso y sueño"
          description="Mejora tu calidad de sueño con estrategias diseñadas para calmar tu mente y lograr un descanso reparador durante las noches."
        />
      </div>
    </div>
  );
};

export default BeneficiosTerapia;