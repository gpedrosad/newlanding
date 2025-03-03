import Image from "next/image";
import HeroTerapia from "./components/HeroTerapia";
import CounterEffect from "./components/CounterEffect";
import BeneficiosTerapia from "./components/BeneficiosTerapia";


export default function Home() {
  return (
    <div>
      <HeroTerapia />
      <BeneficiosTerapia />
      <CounterEffect />

    </div>
  );
}
