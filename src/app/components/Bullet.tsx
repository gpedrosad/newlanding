import React from 'react';

const Bullet: React.FC = () => {
  const bulletItems = [
    'No más dudas sobre tu futuro! Asegura tu estabilidad economica con más pacientes',
    'Dejar de depender de conocidos para conseguir pacientes',
    'Libertad para manejar tus consultas, donde y cuando quieras',
    'Transforma la pasión de tu carrera en una práctica independiente y exitosa',
    'Olvídate de las preocupaciones; consigue pacientes de manera constante y segura',
    'Un plan personalizado, diseñado exclusivamente para tu éxito como profesional independiente',
  ];

  return (
    <div className="bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-8">
          Beneficios de Nuestro Servicio
        </h2>
        <ul className="space-y-6 text-left">
          {bulletItems.map((text, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="h-6 w-6 text-green-500 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-lg text-gray-700">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Bullet;