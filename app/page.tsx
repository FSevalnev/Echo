import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import TryEcho from "./components/TryEcho";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>

      <Navbar />

      <main>

        <Hero />

        <HowItWorks />

        <TryEcho />

        <Features />

      </main>

      <Footer />

    </>
  );
}