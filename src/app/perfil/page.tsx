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

const Profile: React.FC = () => {
  // Mover los datos estáticos fuera del componente
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Si no está montado, renderizar un esqueleto o nada
  if (!mounted) {
    return null; // o return un componente de carga
  }

  // Datos hardcodeados para el perfil
  const profileData: ProfileData = {
    name: "Gonzalo Pedrosa",
    profession: "Psicólogo Clínico",
    professionalDescription:
      "Con más de 15 años de experiencia ayudando a pacientes a encontrar el equilibrio emocional, ofrezco un enfoque integrador basado en evidencia y técnicas modernas de psicoterapia.",
    specializations: ["Terapia Cognitiva", "Mindfulness", "Terapia de Pareja"],
    photo: "/yo.png", // Asegúrate de tener esta imagen o ajusta la ruta
    services: [
      {
        id: "service1",
        name: "Consulta Inicial",
        price_ars: 1500,
        duration: 60,
        selected_slots: {
          Lunes: ["09:00 - 10:00", "14:00 - 15:00"],
          Martes: ["10:00 - 11:00"],
          Miércoles: ["15:00 - 16:00"],
          Jueves: [],
          Viernes: ["09:00 - 10:00"],
          Sábado: [],
          Domingo: [],
        },
      },
      {
        id: "service2",
        name: "Terapia de Seguimiento",
        price_ars: 1200,
        duration: 45,
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
  const averageRating = 4.2;
  const reviewCount = 25;
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
                className="p-4 border rounded-lg mb-4 w-full max-w-md"
              >
                <h4 className="text-xl font-bold">{service.name}</h4>
                <p className="text-gray-600">
                  {service.duration} min |{" "}
                  {service.price_ars?.toLocaleString()} ARS
                </p>
                <p className="mt-2 text-gray-700">
                  Horarios disponibles:{" "}
                  {service.selected_slots?.Lunes.join(", ") || "No disponibles"}
                </p>
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
        <p>© 2025 Mi Perfil. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default Profile;