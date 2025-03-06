"use client";
import React from "react";

const steps = [
  {
    title: "1. Agendar",
    description:
      "Se programa una fecha y horario conveniente para ambos. Recibirás un enlace para conectarte a la sesión el día programado.",
  },
  {
    title: "2. Inicio",
    description:
      "Te conectarás a través de una plataforma de videollamada. Al inicio, se establecerán los objetivos de la sesión, donde podrás compartir tus preocupaciones.",
  },
  {
    title: "3. Desarrollo",
    description:
      "Usaremos el enfoque cognitivo-conductual para identificar patrones de pensamiento y comportamiento que contribuyen a tus dificultades.",
  },
  {
    title: "4. Cierre",
    description:
      "Al finalizar, se hará un resumen de los temas discutidos y se brindarán recomendaciones para el periodo entre sesiones.",
  },
];

const ServicioTerapia = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-gray-100 p-10 md:p-12 rounded-2xl shadow-2xl max-w-4xl mx-auto my-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-700 mb-6">
        ¿Cómo es ir a terapia?
      </h1>
      <p className="text-lg md:text-xl text-gray-800 mb-8 text-center">
        Ofrezco un espacio seguro y confidencial para mejorar tu bienestar emocional. Así es una sesión típica de 50 minutos:
      </p>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl md:text-2xl font-bold text-blue-600 mb-2">
              {step.title}
            </h2>
            <p className="text-gray-700 text-base md:text-lg">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicioTerapia;