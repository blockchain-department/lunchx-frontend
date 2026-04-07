import React from "react";
import Hero from "../components/home/Hero";
import About from "../components/home/About.jsx";
import Tokenomics from "../components/home/Tokenomics.jsx";
import Roadmap from "../components/home/Roadmap.jsx";
import CTA from "../components/home/CTA.jsx";
import FAQ from "../components/Home/FAQ.jsx";
const Home = () => {
  return (
    <div className="bg-transparent text-white">
      <Hero />
      <About />
      <Tokenomics />
      <Roadmap />
      <FAQ />
      <CTA />
    </div>
  );
};

export default Home;
