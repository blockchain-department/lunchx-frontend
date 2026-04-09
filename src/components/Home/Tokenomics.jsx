import React, { useEffect, useRef, useState } from "react";
import { Film, ArrowRight, Sparkles, Lock, Globe, Zap } from "lucide-react";
import { PieChart, pieArcLabelClasses, pieClasses } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import Logo from "/img.png";
import gsap from "gsap";

const Tokenomics = () => {
  const [activeBar, setActiveBar] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

   const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const distribution = [
    { label: "Liquidity and yield generation", percentage: 60, color: "#4F81BD" },
    { label: "Pre-Sale", percentage: 25, color: "#00B050" },
    {
      label: "Presale Bonus",
      percentage: 3.75,
      color: "#FFC000",
    },
    {
      label: "Airdrops",
      percentage: 2.86,
      color: "#AA6FDB",
    },
    {
      label: "Treasury",
      percentage: 8.39,
      color: "#FF0000  ",
    },
  ];
  const pieData = distribution.map((item) => ({
    value: item.percentage,
    label: item.label,
    color: item.color,
  }));
  let size = {
    width: 330,
    height: 330,
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
      className="py-20 bg-secondary relative overflow-hidden px-6 flex items-center justify-center"
    >
      <div className="container relative z-10">
        <div className="text-left mb-20">
          <h2 id="token" className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            
            Tokenomics
          </h2>
          <p className="text-xl text-tertiary">
            Fair distribution, maximum transparency
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            {/* <div className="bg-tertiary/[0.02] transition-transform duration-200 hover:scale-103 backdrop-blur-sm border border-tertiary/5 rounded-2xl p-4 sm:p-6 md:p-8 hover:border-b-yellow-400 hover:border-l-yellow-400">
              <h3 className="text-2xl sm:text-3xl text-center text-primary font-bold mb-6 sm:mb-8">
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
                        <span className="font-mono text-tertiary cursor-help">
                          {formatAddress(
                            "0x321a991f974616addfdea9281cdb3f39faa4537c"
                          )}
                        </span>
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-yellow-300 text-secondary text-xs font-mono rounded shadow-xl tertiaryspace-nowrap z-50">
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
                        className="font-mono text-tertiary-600 hover:text-blue-500 hover:underline transition-all flex items-center gap-1"
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
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 border-b border-tertiary/5 last:border-0 group gap-2 sm:gap-0"
                  >
                    <span className="text-gray-400 text-sm sm:text-base">
                      {item.label}
                    </span>
                    <span className="font-medium text-sm sm:text-base group-hover:text-tertiary transition-colors break-all sm:break-normal">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}
            <div className="w-full overflow-x-auto rounded-2xl border border-tertiary/20 bg-tertiary/5 backdrop-blur-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary text-tertiary">
                    <th className="px-6 py-4 text-left font-medium">Allocation</th>
                    <th className="px-6 py-4 text-right font-medium">Share</th>
                    <th className="px-6 py-4 text-right font-medium">Amount</th>
                    {/* <th className="px-6 py-4 text-right text-gray-400 font-medium hidden sm:table-cell">Note</th> */}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      title: "Public Liquidity",
                      percent: "60%",
                      amount: "2,520,000,000 LX",
                      color: "#4F81BD"
                    },
                    {
                      title: "Pre-Sale",
                      percent: "25%",
                      amount: "1,050,000,000 LX",
                      color: "#00B050"
                    },
                    {
                      title: "Presale Bonus",
                      percent: "3.75%",
                      amount: "157,500,000 LX",
                      color: "#FFC000",
                    },
                    {
                      title: "Airdrops",
                      percent: "2.86%",
                      amount: "120,000,000 LX",
                      color: "#AA6FDB",
                      
                    },
                    {
                      title: "Treasury",
                      percent: "8.39%",
                      amount: "352,500,000 LX",
                      color: "#FF0000",
                    },
                  ].map((item, i, arr) => (
                    <tr
                      key={i}
                      className={`transition-colors hover:bg-tertiary/10 ${i !== arr.length - 1 ? "border-b border-tertiary/10" : ""}`}
                    >
                      <td className={`px-6 py-4 font-medium`} style={{ color: `${item.color}` }}>{item.title}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary"  style={{ color: `${item.color}` }}>{item.percent}</td>
                      <td className="px-6 py-4 text-right text-tertiary font-semibold"  style={{ color: `${item.color}` }}>{item.amount}</td>
                      {/* <td className="px-6 py-4 text-right text-gray-500 hidden sm:table-cell">{item.desc}</td> */}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary bg-tertiary/10">
                    <td className="px-6 py-4 font-bold text-white">Total Supply</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">100%</td>
                    <td className="px-6 py-4 text-right font-bold text-tertiary">4.2B $LX</td>
                    {/* <td className="px-6 py-4 text-right text-gray-400 hidden sm:table-cell">Zero inflation model</td> */}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <PieChart
            series={[
              {
                data: pieData,
                paddingAngle: 2,
                innerRadius: 30,
                arcLabelRadius: 135,
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  // innerRadius: 30,
                  // additionalRadius: -30,
                  // color: "#000000",
                },
                arcLabel: (item) => `${item.value}%`,
              },
            ]}
            slotProps={{
              legend: { hidden: true },
            }}
            sx={{
              [`& .${pieClasses.arcLabel}`]: {
                fill: "white",
                fontSize: "10px",
                fontWeight: "bold",
              },
              [`& .${pieClasses.arc}`]: {
                stroke: "transparent", // or "none" to remove completely
                // stroke: "#your-color"  // or any color to change it
                // strokeWidth: 1 
              },
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
