'use client'

import { useState, useEffect } from 'react';

const CounterEffect = () => {
  const [hoursScheduled, setHoursScheduled] = useState(0);
  const [peopleStarted, setPeopleStarted] = useState(0);

  const hoursTarget = 2746;
  const peopleTarget = 572;
  const incrementSpeed = 20; // Velocidad de incremento en milisegundos

  // Incrementa gradualmente las horas agendadas
  useEffect(() => {
    const intervalId = setInterval(() => {
      setHoursScheduled((prev) => {
        if (prev < hoursTarget) {
          return Math.min(prev + 30, hoursTarget);
        }
        clearInterval(intervalId);
        return hoursTarget;
      });
    }, incrementSpeed);

    return () => clearInterval(intervalId);
  }, []);

  // Incrementa gradualmente las personas que han iniciado terapia
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPeopleStarted((prev) => {
        if (prev < peopleTarget) {
          return Math.min(prev + 10, peopleTarget);
        }
        clearInterval(intervalId);
        return peopleTarget;
      });
    }, incrementSpeed);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-800 mb-4">
          Sesiones agendadas
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Descripción
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {/* Contenedor para Horas Agendadas */}
          <div className="bg-white p-8 rounded-xl shadow-lg flex-1 text-center">
            <div className="text-4xl md:text-6xl font-extrabold text-indigo-600 mb-4">
              {hoursScheduled}
            </div>
            <div className="text-lg md:text-xl font-semibold flex items-center justify-center space-x-2">
              <span role="img" aria-label="horas">⏰</span>
              <span>Horas agendadas</span>
            </div>
          </div>

          {/* Contenedor para Personas Iniciadas */}
          <div className="bg-white p-8 rounded-xl shadow-lg flex-1 text-center">
            <div className="text-4xl md:text-6xl font-extrabold text-indigo-600 mb-4">
              {peopleStarted}
            </div>
            <div className="text-lg md:text-xl font-semibold flex items-center justify-center space-x-2">
              <span role="img" aria-label="personas">👥</span>
              <span>Pacientes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounterEffect;