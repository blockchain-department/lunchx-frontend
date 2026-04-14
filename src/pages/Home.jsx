import React from "react";
import Hero from "../components/Home/Hero";
import About from "../components/Home/About.jsx";
import Presale from "../components/Home/PresaleComp.jsx";
import Tokenomics from "../components/Home/Tokenomics.jsx";
import Roadmap from "../components/Home/Roadmap.jsx";
import FAQ from "../components/Home/FAQ.jsx";
import HowItWorks from "../components/Home/HowItWorks.jsx";
import Different from "../components/Home/Different.jsx";
import Transparency from "../components/Home/Transparency.jsx";

const Home = () => {
  return (
    <div className="bg-transparent text-tertiary">
      <Hero />
      <About />
      <HowItWorks />
      <Presale />
      <Different />
      <Tokenomics />
      <Transparency />
      <Roadmap />
      <FAQ />
    </div>
  );
};

export default Home;
