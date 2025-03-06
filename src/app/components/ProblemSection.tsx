"use client";
import React from "react";

const ProblemSection = () => {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          ¿Te sientes identificado con estos problemas?
        </h2>
        <p className="text-lg text-gray-700 mb-8 p-5">
          Si experimentas alguno de estos síntomas, puedo ayudarte a superar la
          ansiedad y la depresión:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 m-4 p-5">
          <div className="p-4 bg-white shadow-lg rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Tristeza constante</h3>
            <p>
              Sentimientos de desesperanza y pérdida de interés en las actividades
              que solías disfrutar.
            </p>
          </div>
          <div className="p-4 bg-white shadow-lg rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Ansiedad y preocupación</h3>
            <p>
              Dificultades para relajarte, sobrepensamiento y miedo al futuro.
            </p>
          </div>
          <div className="p-4 bg-white shadow-lg rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Problemas de sueño</h3>
            <p>
              Insomnio o dificultad para dormir a causa de pensamientos y
              emociones abrumadoras.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;