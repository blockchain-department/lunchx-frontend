import { useEffect, useRef , useState } from "react";
import { PieChart, pieClasses } from "@mui/x-charts/PieChart";

const Tokenomics = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <section
      id="tokenomics"
      ref={sectionRef}
      className="py-20 bg-secondary relative overflow-hidden px-4 sm:px-6 flex items-center justify-center"
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
            <div className="w-full rounded-2xl border border-tertiary/20 bg-tertiary/5 backdrop-blur-xl">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-primary text-tertiary">
                    <th className="px-2 py-4 text-left font-medium">Allocation</th>
                    <th className="px-2 py-4 text-right font-medium">Share</th>
                    <th className="px-2 py-4 text-right font-medium">Amount</th>
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
                      <td className={`break-all px-2 py-4 font-medium`} style={{ color: `${item.color}` }}>{item.title}</td>
                      <td className="break-all px-2 py-4 text-right font-bold text-primary"  style={{ color: `${item.color}` }}>{item.percent}</td>
                      <td className="break-all px-2 py-4 text-right text-tertiary font-semibold"  style={{ color: `${item.color}` }}>{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary bg-tertiary/10">
                    <td className="px-2 py-4 font-bold text-white">Total Supply</td>
                    <td className="px-2 py-4 text-right font-bold text-primary">100%</td>
                    <td className="px-2 py-4 text-right font-bold text-tertiary">4.2B $LX</td>
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
                stroke: "transparent",
              },
            }}
            {...size}
          >
          </PieChart>
        </div>
      </div>
    </section>
  );
};
export default Tokenomics;
