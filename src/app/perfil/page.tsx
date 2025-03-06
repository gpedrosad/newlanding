"use client";
import React from "react";
import Image from "next/image";
import { AiFillStar, AiOutlineStar, AiOutlineCheckCircle } from "react-icons/ai";
import Reviews from "../components/Reviews";

type Dias =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";
type HorariosSeleccionados = Record<Dias, string[]>;

interface ProfileData {
  name: string | null;
  profession: string;
  professionalDescription: string | null;
  specializations: string[] | null;
  photo: string | null;
  services: Array<{
    id: string;
    name: string;
    price_ars: number | null;
    duration: number | null;
    selected_slots: HorariosSeleccionados | null;
  }> | null;
  professional_id: string | null;
}

declare global {
  interface Window {
    fbq?: (command: string, eventName: string, params?: object) => void;
  }
}

const Profile: React.FC = () => {
  // Mover los datos estáticos fuera del componente
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // o return un componente de carga
  }

  // Datos hardcodeados para el perfil
  const profileData: ProfileData = {
    name: "Gonzalo Pedrosa",
    profession: "Psicólogo Clínico",
    professionalDescription:
      "Con más de 7 años de experiencia ayudando a pacientes a encontrar el equilibrio emocional, ofrezco un enfoque integrador basado en evidencia y técnicas modernas de psicoterapia.",
    specializations: ["Terapia Cognitiva", "Mindfulness", "Depresión", "Ansiedad", "Estrés", "Autoestima"],
    photo: "/yo.png", // Asegúrate de tener esta imagen o ajusta la ruta
    services: [
      {
        id: "service2",
        name: "Sesión Psicológica",
        price_ars: 30000,
        duration: 50,
        selected_slots: {
          Lunes: ["11:00 - 11:45"],
          Martes: ["12:00 - 12:45"],
          Miércoles: ["10:00 - 10:45"],
          Jueves: ["14:00 - 14:45"],
          Viernes: ["16:00 - 16:45"],
          Sábado: [],
          Domingo: [],
        },
      },
    ],
    professional_id: "prof123",
  };

  // Datos de reseñas hardcodeados
  const averageRating = 4.8;
  const reviewCount = 281;
  const isRatingLoading = false;

  // Función auxiliar para renderizar estrellas según la puntuación
  const renderStars = (rating: number) => {
    const roundedRating = Math.round(rating);
    return (
      <div className="flex text-[#FFB703]">
        {Array.from({ length: 5 }, (_, i) =>
          i < roundedRating ? (
            <AiFillStar key={i} size={30} />
          ) : (
            <AiOutlineStar key={i} size={30} />
          )
        )}
      </div>
    );
  };

  // Función para manejar el click en "Agendar cita"
  const handleAgendarClick = () => {
    // Disparar evento en Facebook Pixel
    if (window.fbq) {
      window.fbq("track", "AgendamientoWhatsapp");
    }
    // Redireccionar a la URL de WhatsApp
    window.location.href = "https://walink.co/6626d8";
  };

  return (
    <div className="flex flex-col items-center h-full w-full">
      <div className="w-full bg-white rounded-lg shadow-lg p-10 md:p-16">
        {/* Label de Profesional Recomendado */}
        <div className="mb-4">
          <span className="inline-block bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
            Profesional Recomendado
          </span>
        </div>

        <div className="flex flex-col items-center">
          <Image
            src={profileData.photo || "/images/placeholder.jpg"}
            alt={profileData.name || "Perfil"}
            width={240}
            height={240}
            priority
            className="rounded-lg mb-4 object-cover"
          />
          <h2 className="text-2xl md:text-4xl font-bold">{profileData.name}</h2>
          <p className="text-gray-500 text-xl md:text-2xl">
            {profileData.profession}
          </p>

          {/* Puntaje promedio */}
          <div className="flex flex-col items-center mt-4 space-y-1">
            {isRatingLoading ? (
              <div className="w-24 h-6 bg-gray-300 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-800 text-2xl md:text-3xl font-semibold">
                  {averageRating.toFixed(1)}
                </p>
                {renderStars(averageRating)}
              </div>
            )}
            {isRatingLoading ? (
              <div className="w-32 h-4 bg-gray-300 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-gray-500 text-md md:text-lg">
                ({reviewCount} evaluaciones)
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center p-4 bg-[#023047] rounded-lg text-gray-800 mt-8 max-w-lg mx-auto">
          <AiOutlineCheckCircle className="text-white mr-2" size={24} />
          <span className="text-white">
            Atiende solo en <strong className="font-semibold">modalidad online</strong>.
          </span>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl md:text-3xl font-semibold mb-6">Sobre mi</h3>
          <p className="text-gray-700 text-lg">
            {profileData.professionalDescription ||
              "No hay descripción disponible."}
          </p>
        </div>

        <div className="mt-12">
          <hr className="my-6 border-gray-300" />
          <h3 className="text-xl md:text-3xl font-semibold mb-4 text-left">
            Me especializo en:
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {profileData.specializations ? (
              profileData.specializations.map((specialization, index) => (
                <span
                  key={index}
                  className="bg-[#023047] text-white text-sm md:text-xl font-medium px-3 py-1 rounded-full"
                >
                  {specialization}
                </span>
              ))
            ) : (
              <p>No indica especializaciones.</p>
            )}
          </div>
          <hr className="my-6 border-gray-300" />
        </div>

        <div className="mt-12">
          <h3 className="text-2xl md:text-3xl font-semibold mb-6">
            Servicios ofrecidos
          </h3>
          {profileData.services ? (
            profileData.services.map((service) => (
              <div
                key={service.id}
                className="p-6 bg-white border-l-4 border-[#023047] rounded-lg mb-6 w-full max-w-md shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="flex flex-col space-y-4">
                  <h4 className="text-xl font-bold text-[#023047]">{service.name}</h4>
                  
                  <div className="flex flex-row justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{service.duration} minutos</span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold text-lg text-[#023047]">
                        {service.price_ars?.toLocaleString()} CLP
                      </span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAgendarClick}
                    className="w-full bg-[#023047] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#03506f] active:transform active:scale-98 transition-all duration-200 flex justify-center items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Agendar sesión</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No hay servicios disponibles.</p>
          )}
        </div>
      </div>
      <Reviews />

      <hr className="w-full border-gray-300 mt-12 mb-8" />

      {/* Footer hardcodeado */}
      <div className="w-full bg-white p-6 text-center text-gray-600">
        <p>© 2025 Ansiosamente. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default Profile;