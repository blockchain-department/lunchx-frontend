import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTrailerStore } from "../../utilities/zustand/TrailerStore";
import Logo from "/img.png";

import gsap from "gsap";
import CountDown from "./Countdown";

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { updateToggle } = useTrailerStore();

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex md:flex-row flex-col items-center  justify-center overflow-hidden bg-transparent md:gap-8 lg:gap-12"
      id="hero"
    >
      <video
        className="w-full h-screen absolute -z-1 object-cover"
        muted
        autoPlay
        loop
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>

      <div
        className="relative container flex flex-col items-center justify-center md:flex-row text-left"
        id="content"
      >
        <div className=" flex flex-col justify-center items-center">
          <h1
            className="text-6xl pt-20 lg:text-8xl text-[#E8BE04] md:text-7xl font-bold mb-6 tracking-tighter animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            Launch X
          </h1>

          <p
            className="lg:text-xl md:text-lg text-white mb-12 max-w-2xl animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            Own a piece of cinematic history. RIVERMINED Token brings
            transparency, profit-sharing, and community governance to movie
            production.
          </p>

          <div
            className="flex flex-col md:flex-row justify-center items-center gap-10 mb-16 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <button className="group text-[#008AFC] bg-white px-8 py-4 hover:bg-[#E8BE04] rounded-full font-medium text-lg hover:text-black transition-all inline-flex items-center justify-center gap-2">
              White Paper
              <ArrowRight className="w-5 h-5 hover:text-black text-[#008AFC] group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group text-[#008AFC] bg-white px-8 py-4 hover:bg-[#E8BE04] rounded-full font-medium text-lg hover:text-black transition-all inline-flex items-center justify-center gap-2">
              Start Presale
            </button>
          </div>

          <CountDown remainingTime={100000000} />
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
