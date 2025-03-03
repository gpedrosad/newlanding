import Image from "next/image";
import HeroTerapia from "./components/HeroTerapia";
import CounterEffect from "./components/CounterEffect";
import BeneficiosTerapia from "./components/BeneficiosTerapia";
import Bullet from "./components/Bullet";

export default function Home() {
  return (
    <div>
      <HeroTerapia />
      <BeneficiosTerapia />
      <CounterEffect />
      <Bullet />

    </div>
  );
}
