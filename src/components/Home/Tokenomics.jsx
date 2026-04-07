import React, { useEffect, useRef, useState } from "react";
import { Film, ArrowRight, Sparkles, Lock, Globe, Zap } from "lucide-react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import Logo from "/img.png";
import gsap from "gsap";
const Tokenomics = () => {
  const [activeBar, setActiveBar] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const distribution = [
    { label: "Public & Community Sale", percentage: 30, color: "#C0392B  " },
    { label: "Team & Founders", percentage: 15, color: "#2E86C1  " },
    {
      label: "Advisors & Strategic Partners",
      percentage: 5,
      color: "#1B4F72  ",
    },
    { label: "Ecosystem Growth & Events", percentage: 5, color: "#A8842C" },
    {
      label: "Community Reward & Stacking",
      percentage: 15,
      color: "#E1B12C  ",
    },
    { label: "Treasury", percentage: 30, color: "#F5F3EE  " },
  ];
  const pieData = distribution.map((item) => ({
    value: item.percentage,
    label: item.label,
    color: item.color,
  }));
  const size = {
    width: 300,
    height: 300,
  };
  const StyledText = styled("text")(({ theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: "middle",
    dominantBaseline: "central",
    fontSize: 22,
    fontWeight: 800,
  }));
  function PieCenterLogo({ size = 170 }) {
    const { width, height, left, top } = useDrawingArea();
    return (
      <image
        href={Logo}
        x={left + width / 2 - size / 2}
        y={top + height / 2 - size / 2}
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }
  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  const formatLink = (link) => {
    return `${link.substring(0, 10)}...${link.substring(link.length - 4)}`;
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.6 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // useEffect(() => {
  //   gsap.from("#token", {
  //     y: 50,          
  //     opacity: 1,
  //     rotation: 10,   
  //     duration:0.4, 
     
     
  //   });
  // }, []);

  return (
    <section
      id="tokenomics"
      ref={sectionRef}
      className="py-32 bg-[#072542] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(232,190,4,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(232,190,4,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 id="token" className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            
            Tokenomics
          </h2>
          <p className="text-xl text-white">
            Fair distribution, maximum transparency
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="bg-white/[0.02] transition-transform duration-200 hover:scale-103 backdrop-blur-sm border border-white/5 rounded-2xl p-4 sm:p-6 md:p-8 hover:border-b-yellow-400 hover:border-l-yellow-400">
              <h3 className="text-2xl sm:text-3xl text-center text-[#E8BE04] font-bold mb-6 sm:mb-8">
                Token Info
              </h3>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { label: "Name", value: "RIVERMIND" },
                  { label: "Symbol", value: "RMD" },
                  { label: "Supply", value: "1M RIVERMINED" },
                  { label: "Network", value: "Sepolia" },
                  {
                    label: "Address",
                    value: (
                      <div className="group relative inline-block">
                        <span className="font-mono text-white cursor-help">
                          {formatAddress(
                            "0x321a991f974616addfdea9281cdb3f39faa4537c"
                          )}
                        </span>
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-yellow-300 text-black text-xs font-mono rounded shadow-xl whitespace-nowrap z-50">
                          0x321a991f974616addfdea9281cdb3f39faa4537c
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: "Link",
                    value: (
                      <a
                        href="https://sepolia.etherscan.io/token/0x321a991f974616addfdea9281cdb3f39faa4537c"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-white-600 hover:text-blue-500 hover:underline transition-all flex items-center gap-1"
                      >
                        {formatLink(
                          "0x321a991f974616addfdea9281cdb3f39faa4537c"
                        )}
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 border-b border-white/5 last:border-0 group gap-2 sm:gap-0"
                  >
                    <span className="text-gray-400 text-sm sm:text-base">
                      {item.label}
                    </span>
                    <span className="font-medium text-sm sm:text-base group-hover:text-white transition-colors break-all sm:break-normal">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <PieChart
            series={[
              {
                data: pieData,
                paddingAngle: 2,
                innerRadius: 30,
               
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "yellow",
                },
                arcLabel: (item) => `${item.value}%`,
              },
            ]}
            slotProps={{
              legend: { hidden: true },
            }}
            {...size}
          >
            {/* <PieCenterLogo size={170} /> */}
          </PieChart>
        </div>
      </div>
    </section>
  );
};
export default Tokenomics;
