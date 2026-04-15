import { DollarSign, Flame, Gift } from "lucide-react";
import Stats from "./Stats";
const About = () => {

const features = [
  {
    icon: Flame,
    title: "No team token allocation",
    desc: "1",
  },
  {
    icon: Gift,
    title: "Multi-signature treasury governance",
    desc: "2",
  },
  {
    icon: DollarSign,
    title: "On-chain verifiable buybacks and burns",
    desc: "3",
  },
  {
    icon: DollarSign,
    title: "Dynamic liquidity managed through DLMM",
    desc: "4",
  },
];

  return (
    <section
      id="about"
      className="py-20 relative bg-secondary flex items-center justify-center"
    >
      <div className="flex w-full justify-center items-center px-6">
      <div className="container flex md:flex-row flex-col justify-between items-baseline gap-8">
        
          <div className="relative flex  flex-col lg:flex-row justify-between items-center md:min-w-[50%] w-full">
            <div className="flex flex-col">
              
                <h2
                  className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
                  id="heading"
                >
                  Built For <span className="text-primary">Transparency</span>
                </h2>
                <p className="text-base sm:text-md md:text-lg lg:text-xl max-w-2xl text-tertiary" id="subHeading">
                   LaunchX is designed with verifiable, on-chain mechanics and structured liquidity management. All key protocol actions are designed to be transparent and observable on-chain.
                </p>
              {/* <Stats /> */}
            </div>
              {/* <img
                className="lg:size-100 md:size-[35%] md:right-0 md:pt-0 pt-10"
                src="/imggg.png"
                alt=""
              /> */}
          </div>
          
          
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:max-w-[50%] w-full">
            {features.map((feature, i) => (
              <div className="relative w-full">
                <div className="absolute top-0 left-0 md:w-15 md:h-25 w-18 h-25 rounded-tl-full rotate-180 bg-secondary z-1"></div>
                <p className="absolute top-0 left-[2%] z-2 text-primary text-7xl font-semibold mb-10">{i+1}</p>
                <div
                  key={i}
                  className="h-full relative group bg-tertiary/5 backdrop-blur-xl border border-tertiary/5 rounded-2xl p-8 hover:bg-tertiary/[0.04] hover:border-tertiary/10"
                >
                  <p className="text-primary text-7xl font-semibold mb-10">&nbsp;</p>
                  <h3 className="text-xl md:text-2xl font-semibold">{feature.title}</h3>
                </div>
              </div>
            ))}
          </div>
        

        
      </div>
      </div>
    </section>
  );
};

export default About;
