'use client';

import React, { useState } from 'react';
import emailjs from 'emailjs-com';

const ReviewPage = () => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const templateParams = {
      name,
      city,
      comment,
    };

    emailjs
      .send('service_nq7yg9k', 'template_wb0kpic', templateParams, 'LTywyQvKU3ya4QAVu')
      .then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
          setEmailStatus('Reseña enviada exitosamente. ¡Gracias por tu opinión!');
        },
        (error) => {
          console.log('FAILED...', error);
          setEmailStatus('Ocurrió un error al enviar la reseña. Inténtalo nuevamente.');
        }
      );

    // Limpiar el formulario
    setName('');
    setCity('');
    setComment('');
  };

  return (
    <div className="flex flex-col items-center py-10 bg-gray-50">
      <div className="mb-6">
        <img
          src="/images/yoo.jpg"
          alt="Foto de perfil"
          className="rounded-full w-48 h-48 object-cover shadow-lg"
        />
      </div>

      <div className="max-w-4xl text-center mb-8 mx-10">
        <h2 className="text-3xl font-bold mb-4">Tu opinión importa 🗣️</h2>
        <p className="text-lg text-gray-700 mb-4">
          Me encantaría saber cómo ha sido tu experiencia. Algunas preguntas que pueden guiarte:
        </p>
        <ul className="list-disc list-inside text-left mb-2 text-lg text-gray-700">
          <li>¿Cómo te sentiste en las sesiones?</li>
          <li>¿Qué impacto tuvo en tu bienestar emocional?</li>
          <li>¿Recomendarías este servicio a alguien más? ¿Por qué?</li>
        </ul>
      </div>

      <div className="w-11/12 max-w-md bg-white p-6 rounded-lg shadow-md mb-32">
        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-left">
            <label htmlFor="name" className="block text-gray-700 text-lg font-bold mb-2">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu nombre"
              required
            />
          </div>

          <div className="mb-4 text-left">
            <label htmlFor="city" className="block text-gray-700 text-lg font-bold mb-2">
              Ciudad
            </label>
            <input
              type="text"
              id="city"
              name="city"
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu ciudad"
              required
            />
          </div>

          <div className="mb-4 text-left">
            <label htmlFor="comment" className="block text-gray-700 text-lg font-bold mb-2">
              Comentario
            </label>
            <textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe aquí tu comentario"
              rows={5}
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Enviar Reseña
            </button>
          </div>
        </form>

        {emailStatus && (
          <p className="text-center text-green-500 mt-4">{emailStatus}</p>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;