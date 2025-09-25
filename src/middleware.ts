// middleware.ts
import { NextResponse, NextRequest } from "next/server";

const EXP_SLUG = "hero-tdah";
const AB_COOKIE = `ab_${EXP_SLUG}`;
const ANON_COOKIE = "anon_id";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 1) anon_id sticky (HttpOnly lo setea el middleware, el client lo solo lee el valor si lo pasas por props)
  let anon = req.cookies.get(ANON_COOKIE)?.value;
  if (!anon) {
    anon = crypto.randomUUID();
    res.cookies.set(ANON_COOKIE, anon, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 90, // 90 días
    });
  }

  // 2) Variante del hero sticky en cookie (A|B) si no existe ya
  let v = req.cookies.get(AB_COOKIE)?.value as "A" | "B" | undefined;
  if (!v || (v !== "A" && v !== "B")) {
    v = Math.random() < 0.5 ? "A" : "B";
    res.cookies.set(AB_COOKIE, v, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    });
  }

  return res;
}

export const config = {
  // Aplica a las rutas públicas (ajusta si necesitas excluir APIs estáticas)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};