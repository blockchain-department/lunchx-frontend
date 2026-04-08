import React, { useRef } from "react";
import {
  Film,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Zap,
  Server,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
const Roadmap = () => {
  
  const cardsRef = useRef([]);

 const phases = [
  {
    q: "Q1 26",
    title: "Token Setup & Planning",
    status: "upcoming",
    desc: "Creation of the Solana SPL token, metadata configuration, and allocation planning for presale, liquidity, team, and treasury. Wallets are prepared and launch readiness checks begin.",
    date: "January 10, 2026",
    number: 1,
  },
  {
    q: "Q2 26",
    title: "Presale & Landing Page Launch",
    date: "February 20, 2026",
    desc: "Presale system goes live with structured pricing and vesting logic. The official landing page is launched to communicate tokenomics, participation steps, and project narrative.",
    status: "upcoming",
    number: 2,
  },
  {
    q: "Q3 26",
    title: "Token Launch & Liquidity Setup",
    date: "March 25, 2026",
    desc: "Token is deployed on Solana mainnet with liquidity initialization. Presale distributions begin with 75% unlock, while launch coordination and monitoring ensure a smooth go-live.",
    status: "upcoming",
    number: 3,
  },
  {
    q: "Q4 26",
    title: "Rewards & Ecosystem Expansion",
    status: "upcoming",
    desc: "Genesis Drop and Lunar Cycle reward campaigns begin, including holder snapshots, eligibility tracking, and monthly distributions to incentivize long-term participation.",
    date: "April 30, 2026",
    number: 4,
  },
];

  useGSAP(()=>{

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
        trigger: '#roadmap',
        start: 'top 80%',
        end: 'bottom 80%',
        scrub: 1
      }
      })
        .from(cardsRef.current, {
          x: (i) => (i % 2 === 0 ? -150 : 150),
          opacity: 0,
          stagger: 0.3,
        });
    });

    return () => ctx.revert();

  },{})

  return (
    <section
      id="roadmap"
      className="relative bg-[#072542] py-16 sm:py-24 lg:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-700/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-700/20 via-transparent to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Roadmap
          </h2>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b bg-yellow-100">
            <div className="w-full h-full border-l-2 border-dashed border-yellow-200" />
          </div>
          <div className="space-y-8 sm:space-y-12">
            {phases.map((phase, i) => (
              <div
                className={`flex flex-col-reverse lg:flex-row items-center gap-4 ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
                ref={(el) => (cardsRef.current[i] = el)}
              >
                <div
                  className={`w-full lg:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? "lg:text-right" : "lg:text-left"
                  }`}
                >
                  <div className="group inline-block w-full">
                    <div
                      className={`relative rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-md transition-all duration-300 ${
                        phase.status === "active"
                          ? "bg-gradient-to-br  from-blue-400/40 to-blue-300/40 border-2 border-purple-300/50 shadow-xl shadow-purple-500/20"
                          : "bg-blue-200/20 border border-blue-400/30 hover:border-b-yellow-400 hover:border-l-yellow-400 hover:bg-gradient-to-br hover:from-purple-200/30 hover:to-indigo-400/30 hover:border-2 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/15 hover:scale-[1.02]"
                      }`}
                    >
                      {phase.status === "active" && (
                        <div
                          className={`absolute top-3 w-2 h-2 bg-white rounded-full animate-pulse ${
                            i % 2 === 0 ? "right-3" : "left-3"
                          }`}
                        />
                      )}
                      {phase.status !== "active" && (
                        <div
                          className={`absolute top-3 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 ${
                            i % 2 === 0 ? "right-3" : "left-3"
                          }`}
                        />
                      )}
                      <div
                        className={`flex items-start gap-3 ${
                          i % 2 === 0 ? "lg:flex-row-reverse" : "lg:flex-row"
                        }`}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110 flex-shrink-0">
                          <Server className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div
                          className={`flex-1 ${
                            i % 2 === 0 ? "lg:text-right" : "lg:text-left"
                          }`}
                        >
                          <div
                            className={`text-xs sm:text-sm mb-1 transition-colors duration-300 ${
                              phase.status === "active"
                                ? "text-gray-400 "
                                : "text-gray-400 group-hover:text-gray-300"
                            }`}
                          >
                            {phase.q}
                          </div>
                          <h3
                            className={`text-lg sm:text-xl  font-semibold tracking-wide transition-colors duration-300 ${
                              phase.status === "active"
                                ? "text-white "
                                : "text-gray-300 group-hover:text-white"
                            }`}
                          >
                            {phase.title}
                          </h3>
                          <h3 className="text-lg sm:text-xl font-semibold tracking-wide transition-colors duration-300 text-yellow-300">
                            {phase.date}
                          </h3>
                          <p
                            className={`mt-2 text-sm sm:text-base leading-relaxed transition-all duration-300 max-h-0 overflow-hidden opacity-0 group-hover:max-h-32 group-hover:opacity-100 ${
                              phase.status === "active"
                                ? "text-gray-200 !max-h-32 !opacity-100"
                                : "text-gray-300 group-hover:text-gray-200"
                            }`}
                          >
                            {phase.desc}
                          </p>
                          {/* <p
                            className={`mt-2 text-sm sm:text-base leading-relaxed transition-all duration-300 max-h-0 overflow-hidden opacity-0 group-hover:max-h-20 group-hover:opacity-100 ${
                              phase.status === "active"
                                ? "text-gray-200 !max-h-20 !opacity-100"
                                : "text-gray-400 group-hover:text-gray-200"
                            }`}
                          >
                            {phase.status === "active"
                              ? "Currently in progress - actively developing and launching the platform"
                              : "Upcoming phase in our development roadmap"}
                          </p> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 relative z-2 group">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center text-xl sm:text-2xl font-bold border-4 transition-all duration-300 ${
                      phase.status === "active"
                        ? "bg-gradient-to-br from-cyan-200 to-blue-300 border-cyan-200 text-white shadow-md shadow-cyan-500/50"
                        : "bg-[#008AFC] border-[#008AFC] text-purple-200  group-hover:bg-gradient-to-br  group-hover:from-yellow-400/80 group-hover:to-yellow-400/80 group-hover:text-white group-hover:shadow-lg group-hover:shadow-cyan-500/30"
                    }`}
                  >
                    {phase.number}
                  </div>
                </div>
                <div className="hidden lg:block w-[calc(50%-2rem)]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
};
export default Roadmap;
