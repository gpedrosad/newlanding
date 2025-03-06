"use client";
import React from "react";

const TherapyCTA = () => {
  const handleClick = () => {
    window.location.href = "https://walink.co/6626d8";
  };

  return (
    <section className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-100 to-blue-50">
      <div className="text-center max-w-2xl px-4">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-6">
          No esperes más para sentirte mejor
        </h2>
        <p className="text-lg text-gray-700 mb-8">
          Estoy aquí para acompañarte en tu camino a sentirte mejor. Haz el primer paso hoy mismo y comienza tu transformación.
        </p>
        <button
          onClick={handleClick}
          className="bg-blue-600 text-white py-4 px-8 rounded-full text-xl font-semibold shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Agenda tu primera sesión
        </button>
      </div>
    </section>
  );
};

export default TherapyCTA;