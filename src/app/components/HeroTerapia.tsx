'use client'

import React, { useEffect, useRef, useState } from 'react';


const HeroTerapia = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`container mx-auto py-16 px-4 transition-opacity duration-1000 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col md:flex-row items-center">
        {/* Columna de Texto */}
        <div className="md:w-1/2 p-4">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            Transforma tu vida hoy
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Descubre el poder de sanar y reencontrar tu equilibrio emocional con una terapia profesional y compasiva.
          </p>
          <a
            href="https://walink.co/6626d8"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded shadow transition-colors duration-300"
          >
            Agenda tu consulta ahora
          </a>
        </div>

        {/* Columna de Imagen */}
        <div className="md:w-1/2 p-4 ">
          <img
            src="/yo.png"
            alt="Imagen representativa de terapia"
            className="w-full"
          />
        </div>
        
      </div>
    </section>
  );
};

export default HeroTerapia;