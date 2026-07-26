import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import TryEcho from "./components/TryEcho";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
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

        <Testimonials />

      </main>

      <Footer />

    </>
  );
}