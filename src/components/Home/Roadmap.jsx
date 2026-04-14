import React, { useRef } from "react";
import {
  Film,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Zap,
  Server,
  Dot,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
const Roadmap = () => {
  
  const cardsRef = useRef([]);

 const phases = [
  {
    q: "Q2 26",
    title: "Launch",
    status: "upcoming",
    desc: [
    "	Token launch at $0.010 ",
"Initial DLMM liquidity deployment" ,
"Activation of the Buyback & Burn Engine ",
"Deployment of the transparency dashboard ",
    ],
    
    date: "April, 2026",
    number: 1,
  },
  {
    q: "Q2 26",
    title: "Growth",
    date: "May 2026",
    desc: [
      "	Initiation of monthly holder “Air Drop” rewards ",
      "	Community expansion and strategic marketing ",
      "	Ongoing liquidity optimization and monitoring ",

    ],
    status: "upcoming",
    number: 2,
  },
  {
    q: "Q2 26",
    title: "Market Positioning ",
    date: "June 2026",
    desc: [
      "	Expansion of the Digital Fuel Narrative ",
      "	Increased market visibility and audience reach ",
      "	Continued execution of buybacks and supply reduction ",

    ],
    status: "upcoming",
    number: 3,
  },
  {
    q: "2027+",
    title: "Maturity ",
    status: "upcoming",
    desc: [
      	"Progression toward the 3B supply target" ,
        "Transition to long-term holder yield models",
	      "Ongoing liquidity and treasury optimization",

    ],
    date: "2027+",
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
      className="relative bg-secondary py-20 overflow-hidden px-6 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-700/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-700/20 via-transparent to-transparent" />
      <div className="container relative z-10">
        <div className="flex flex-col justify-start items-start mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-tertiary">
            Roadmap
          </h2>
          <h3 className="text-tertiary text-lg mt-5">
            A structured rollout focused on income generation, liquidity, transparency, and long-term supply reduction.
          </h3>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b bg-primary/10">
            <div className="w-full h-full border-l-2 border-dashed border-primary/20" />
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
                      className={`relative rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-tertiary/5 backdrop-blur-xl transition-all duration-300 ${
                          "border-tertiary/10  border hover:shadow-lg hover:shadow-tertiary/15 hover:scale-[1.02] bg-linear-to-br hover:from-secondary/20 hover:to-secondary/80"
                      }`}
                    >
                      {phase.status === "active" && (
                        <div
                          className={`absolute top-3 w-2 h-2 bg-tertiary rounded-full animate-pulse ${
                            i % 2 === 0 ? "right-3" : "left-3"
                          }`}
                        />
                      )}
                      {phase.status !== "active" && (
                        <div
                          className={`absolute top-3 w-2 h-2 bg-tertiary rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 ${
                            i % 2 === 0 ? "right-3" : "left-3"
                          }`}
                        />
                      )}
                      <div
                        className={`flex items-start gap-3 ${
                          i % 2 === 0 ? "lg:flex-row-reverse" : "lg:flex-row"
                        }`}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/5 backdrop-blur-xl rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-tertiary/20 group-hover:scale-110 flex-shrink-0">
                          <Server className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary" />
                        </div>
                        <div
                          className={`flex-1 ${
                            i % 2 === 0 ? "lg:text-right" : "lg:text-left"
                          }`}
                        >
                          {/* <div
                            className={`text-xs sm:text-sm mb-1 transition-colors duration-300 ${
                              phase.status === "active"
                                ? "text-gray-400 "
                                : "text-gray-400 group-hover:text-gray-300"
                            }`}
                          >
                            {phase.q}
                          </div> */}
                          <h3
                            className={`text-lg sm:text-xl  font-semibold tracking-wide transition-colors duration-300 ${
                              phase.status === "active"
                                ? "text-tertiary "
                                : "text-gray-300 group-hover:text-tertiary"
                            }`}
                          >
                            {phase.title}
                          </h3>
                          <h3 className="text-sm sm:text-md font-semibold tracking-wide transition-colors duration-300 text-primary">
                            {phase.date}
                          </h3>
                          <p
                            className={`mt-2 text-sm sm:text-base leading-relaxed transition-all duration-300 max-h-0 overflow-hidden opacity-0 group-hover:max-h-32 group-hover:opacity-100 ${
                              phase.status === "active"
                                ? "text-gray-200 !max-h-32 !opacity-100"
                                : "text-gray-300 group-hover:text-gray-200"
                            }`}
                          >
                             {phase.desc.map((item, i) => (
                                <span key={i} className="flex flex-row gap-1 justify-cemter items-center">
                                  <Dot /> {item}
                                 </span>
                       ))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 relative z-2 group">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold border-4 transition-all duration-300 ${
                        "border-secondary bg-primary text-secondary group-hover:shadow-lg group-hover:shadow-cyan-500/30"
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
            className="absolute w-1 h-1 bg-tertiary/30 rounded-full animate-pulse"
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
