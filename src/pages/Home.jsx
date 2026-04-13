import React from "react";
import Hero from "../components/Home/Hero";
import About from "../components/Home/About.jsx";
import Presale from "../components/Home/PresaleComp.jsx";
import Tokenomics from "../components/Home/Tokenomics.jsx";
import Roadmap from "../components/Home/Roadmap.jsx";
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
