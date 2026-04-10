import React, { useEffect, useRef, useState } from "react";
import { Film, ArrowRight, Sparkles, Lock, Globe, Zap } from "lucide-react";
import Bg from "../../assets/global/bgggg.jpeg";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DollarSign, Rocket, Gift } from "lucide-react";
import Stats from "./Stats";
const About = () => {
  const cardsRef = useRef([]);

  const features = [
    {
      icon: Rocket,
      title: "Custom Solana Launch",
      desc: "Full control over token setup, presale, liquidity, and treasury for a professional launch.",
    },
    {
      icon: Gift,
      title: "Holder Rewards",
      desc: "Genesis Drop and Lunar Cycle reward campaigns incentivize long-term participation.",
    },
    {
      icon: DollarSign,
      title: "Structured Presale",
      desc: "Transparent presale pricing, vesting, and allocations for fair and secure participation.",
    },
  ];

  // useGSAP(() => {
  //   const ctx = gsap.context(() => {
  //     gsap
  //       .timeline({
  //         scrollTrigger: {
  //           trigger: "#about",
  //           start: "top 80%",
  //           end: "bottom 80%",
  //           scrub: 1,
  //         },
  //       })
  //       .from("#heading", {
  //         x: -150,
  //         opacity: 0,
  //       })
  //       .from("#subHeading", {
  //         x: -150,
  //         opacity: 0,
  //       })
  //       .from(cardsRef.current, {
  //         x: -150,
  //         opacity: 0,
  //         stagger: 0.3,
  //       });
  //   });

  //   return () => ctx.revert();
  // }, {});

  return (
    <section
      id="about"
      className="py-20 relative bg-secondary flex items-center justify-center"
    >
      <div className="flex w-full justify-center items-center px-6">
      <div className="container flex flex-col justify-between gap-8">
        
          <div className="relative flex  flex-col lg:flex-row justify-between items-center">
            <div className="flex flex-col">
              
                <h2
                  className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
                  id="heading"
                >
                  What is <span className="text-primary">LaunchX</span>?
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl text-tertiary" id="subHeading">
                   Launch X Coin ($LX) is a Solana-based token built around
                   scarcity, structured tokenomics, and a strategic presale
                   model.
                </p>
              {/* </div> */}
              <Stats />
            </div>
            {/* <div className="flex right-0 justify-center items-center"> */}
              <img
                className="md:w-140 md:right-0"
                src="/imggg.png"
                alt=""
              />
            {/* </div> */}
          </div>
          
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                ref={(el) => (cardsRef.current[i] = el)}
                className="group bg-tertiary/5 backdrop-blur-xl border border-tertiary/5 rounded-2xl p-8 hover:border-l-primary hover:border-b-primary hover:bg-tertiary/[0.04] hover:border-tertiary/10"
              >
                <feature.icon className="w-10 h-10 mb-6 text-primary transition-transform" />
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-tertiary">{feature.desc}</p>
              </div>
            ))}
          </div>
        

        
      </div>
      </div>
    </section>
  );
};

export default About;
