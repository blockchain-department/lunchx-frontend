import React from "react";
import Hero from "../components/home/Hero";
import About from "../components/home/About.jsx";
import Presale from "../components/Home/Presale.jsx";
import Tokenomics from "../components/home/Tokenomics.jsx";
import Roadmap from "../components/home/Roadmap.jsx";
import FAQ from "../components/Home/FAQ.jsx";

const Home = () => {
  return (
    <div className="bg-transparent text-tertiary">
      <Hero />
      <About />
      <Presale />
      <Tokenomics />
      <Roadmap />
      <FAQ />
    </div>
  );
};

export default Home;
