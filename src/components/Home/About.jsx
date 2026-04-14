import { DollarSign, Flame, Gift } from "lucide-react";
import Stats from "./Stats";
const About = () => {

const features = [
  {
    icon: Flame,
    title: "Daily Buyback & Burn Engine",
    desc: "Trading fees generated from DLMM liquidity are used for daily buybacks and permanent token burns, creating continuous deflationary pressure.",
  },
  {
    icon: Gift,
    title: "Holder Incentives",
    desc: "Includes a 15% presale bonus for 30-day holders and monthly airdrops distributed over 12 months based on snapshot eligibility.",
  },
  {
    icon: DollarSign,
    title: "Transparent Presale",
    desc: "Presale at $0.00420 with a clear allocation structure and bonus incentives for long-term holders.",
  },
];

  return (
    <section
      id="about"
      className="py-20 relative bg-secondary flex items-center justify-center"
    >
      <div className="flex w-full justify-center items-center px-6">
      <div className="container flex flex-col justify-between gap-8">
        
          <div className="relative flex  flex-col lg:flex-row justify-between items-center">
            <div className="flex flex-col lg:w-[50%]">
              
                <h2
                  className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
                  id="heading"
                >
                  What is <span className="text-primary">LaunchX</span>?
                </h2>
                <p className="text-base sm:text-md md:text-lg lg:text-xl max-w-2xl text-tertiary" id="subHeading">
                   LaunchX Coin ($LX) is a Solana-based token engineered around a real economic model.
                   Rather than relying on static liquidity or one-time events, LaunchX uses yield-generating liquidity to continuously fund buybacks and reduce circulating supply.
                   This creates a direct connection between market activity and long-term scarcity.

                </p>
              <Stats />
            </div>
              <img
                className="lg:size-100 md:size-[35%] md:right-0 md:pt-0 pt-10"
                src="/imggg.png"
                alt=""
              />
          </div>
          
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
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
