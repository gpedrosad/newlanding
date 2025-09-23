"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone } from "lucide-react";
import HeroBandit from "@/app/test/_components/HeroBandit";

/* =================== Tipos =================== */
interface FormData {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}
interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  consent?: string;
}

/* =================== Helpers =================== */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name || data.name.trim().length < 2) errors.name = "Ingresa tu nombre";
  if (!data.email || !emailRegex.test(data.email)) errors.email = "Correo no válido";
  const digits = (data.phone || "").replace(/\D/g, "");
  if (!digits || digits.length < 8) errors.phone = "Número no válido";
  if (!data.consent) errors.consent = "Debes aceptar la política de privacidad";
  return errors;
}

/* =================== Estilos compartidos =================== */
const btnBlack =
  "rounded-lg bg-black text-white px-4 py-3 text-base sm:text-sm font-semibold shadow-sm transition " +
  "hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const inputWrap = (errored?: boolean) =>
  `relative flex items-center rounded-xl border bg-white ${
    errored ? "border-rose-400" : "border-gray-300"
  } focus-within:border-gray-400`;

const inputClass =
  "w-full rounded-xl border-0 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-400";

/* =================== Página =================== */
export default function Page() {
  const router = useRouter();
  const [data, setData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(() => Object.keys(validate(data)).length === 0, [data]);

  function handleChange<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = validate(data);
    if (Object.keys(v).length) return setErrors(v);

    setSubmitting(true);
    router.push("/test/tdah?step=1");
  }

  return (
    <div className="min-h-svh w-full bg-white">
      {/* Header sobrio consistente */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-black" />
            <span className="text-sm font-semibold text-gray-900">TDAH · Inicio</span>
          </div>
          <span className="text-xs text-gray-500">Paso 1 de 2</span>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        {/* HERO con bandit */}
        <HeroBandit
          slug="hero-tdah"
          onPrimary={() => {
            const el = document.getElementById("form-start");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="mb-8"
        />

        <motion.div
          id="form-start"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:p-10"
        >
          <header className="mb-6 md:mb-8">
            <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
              Completa tus datos para empezar
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Usaremos esta información para contactarte si es necesario.
            </p>
          </header>

          <form onSubmit={onSubmit} className="grid gap-6">
            {/* Nombre */}
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-800">
                Nombre y apellido
              </label>
              <div className={inputWrap(!!errors.name)}>
                <div className="pl-3 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={data.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={inputClass}
                  placeholder="Ej. Arantza Flores"
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && <p className="text-sm text-rose-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-800">
                Email
              </label>
              <div className={inputWrap(!!errors.email)}>
                <div className="pl-3 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputClass}
                  placeholder="tu@correo.com"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-sm text-rose-600">{errors.email}</p>}
            </div>

            {/* Teléfono */}
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-800">
                Teléfono (WhatsApp)
              </label>
              <div className={inputWrap(!!errors.phone)}>
                <div className="pl-3 text-gray-400">
                  <Phone size={18} />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={data.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={inputClass}
                  placeholder="+56 9 1234 5678"
                  aria-invalid={!!errors.phone}
                />
              </div>
              <p className="text-xs text-gray-500">Usa tu número con código de país (ej. +56, +54).</p>
              {errors.phone && <p className="text-sm text-rose-600">{errors.phone}</p>}
            </div>

            {/* Consentimiento */}
            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                checked={data.consent}
                onChange={(e) => handleChange("consent", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                Acepto la{" "}
                <a href="/privacidad" className="underline underline-offset-2">
                  política de privacidad
                </a>{" "}
                y recibir información relacionada con mi test.
              </label>
            </div>
            {errors.consent && <p className="-mt-4 text-sm text-rose-600">{errors.consent}</p>}

            {/* Acciones */}
            <div className="mt-2 flex flex-col gap-3">
              <button type="submit" disabled={submitting || !isValid} className={btnBlack}>
                {submitting ? "Procesando…" : "Empezar test"}
              </button>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex h-2 w-2 rounded-full bg-black" />
                Seguro y confidencial · Tiempo estimado: 4–6 minutos
              </div>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}