import Image from "next/image";
import HeroTerapia from "./components/HeroTerapia";
import CounterEffect from "./components/CounterEffect";
import BeneficiosTerapia from "./components/BeneficiosTerapia";
import Bullet from "./components/Bullet";
import FAQTerapia from "./components/FAQTerapia"; 
import ProblemSection from "./components/ProblemSection"; 
import TherapyCTA from "./components/TherapyCTA"; 
import ServicioTerapia from "./components/ServicioTerapia";




export default function Home() {
  return (
    <div>
      <HeroTerapia />
      <BeneficiosTerapia />
      <CounterEffect />
      <Bullet />
      <ServicioTerapia />
      <FAQTerapia />
      <ProblemSection />
      <TherapyCTA />

    </div>
  );
}
