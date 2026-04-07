import React from "react";
import Hero from "../components/home/Hero";
import About from "../components/home/About.jsx";
import Tokenomics from "../components/home/Tokenomics.jsx";
import Roadmap from "../components/home/Roadmap.jsx";
import Stats from "../components/Home/Stats.jsx";
import FAQ from "../components/Home/FAQ.jsx";
import CountDown from "../components/Home/Countdown.jsx";
const Home = () => {
  return (
    <div className="bg-transparent text-white">
      <Hero />
      <Stats />
      <About />
      <Tokenomics />
      <Roadmap />
      <FAQ />
    </div>
  );
};

export default Home;
