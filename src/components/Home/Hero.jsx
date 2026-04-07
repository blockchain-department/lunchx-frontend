import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTrailerStore } from "../../utilities/zustand/TrailerStore";
import Logo from "/img.png";

import gsap from "gsap";

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { updateToggle } = useTrailerStore();

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex md:flex-row flex-col items-center  justify-center overflow-hidden bg-transparent md:gap-8 lg:gap-12"
      id="hero"
      // style={{backgroundSize: "100% 100%",backgroundRepeat: "no-repeat"}}
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
        className="relative container flex flex-col items-center justify-between md:flex-row text-left"
        id="content"
      >
        <div className="">
          <h1
            className="text-6xl pt-20 lg:text-8xl md:text-7xl font-bold mb-6 tracking-tighter animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            The Duke of
            <br />
            <span className="text-[#E8BE04] inline-block mt-2 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text animate-gradient">
              Marylebone
            </span>
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
            className="flex flex-col items-start md:flex-row gap-4 mb-16 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <button
              className="group text-[#008AFC] bg-white px-8 py-4 hover:bg-[#E8BE04] rounded-full font-medium text-lg hover:text-black transition-all inline-flex items-center justify-center gap-2"
              onClick={() => updateToggle(true)}
            >
              Watch Trailer
              <ArrowRight className="w-5 h-5 hover:text-black text-[#008AFC] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            {[
              { value: "$2.5M", label: "Raised", delay: "0s" },
              { value: "5K+", label: "Holders", delay: "0.1s" },
              { value: "30%", label: "ROI Target", delay: "0.2s" },
            ].map((stat, i) => (
              <div
                key={i}
                className="group cursor-pointer"
                style={{
                  animation: `float 3s ease-in-out infinite`,
                  animationDelay: stat.delay,
                }}
              >
                <div className="text-3xl lg:text-4xl md:text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <img src={Logo} className="lg:size-100 md:size-90 sm:size-70 " />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#062139] to-transparent" />

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
