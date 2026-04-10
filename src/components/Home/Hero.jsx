import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import CountDown from "./Countdown";

const Hero = () => {
  const containerRef = useRef(null);

  const handleScrollIntoView = (id) => {
    const element = document.querySelector(id);
    element.scrollIntoView({ behavior: "smooth" });
  };

  const secondsLeft = Math.floor((new Date("2026-04-20").getTime() - Date.now()) / 1000);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7; // 👈 slower (0.5x)
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex md:flex-row flex-col items-center  justify-center overflow-hidden bg-transparent md:gap-8 lg:gap-12"
      id="hero"
    >

      <div className="absolute w-full h-full bg-secondary/50 -z-1"></div>

      <video ref={videoRef} className='absolute w-full h-full top-0 left-0 object-cover -z-2 opacity-50'  autoPlay loop muted>
        <source src="/LAUNCHX-VIDEO.mp4" type="video/mp4" />
      </video>

      <video
        className="w-full h-full absolute -z-3 object-cover"
        muted
        autoPlay
        loop
      >
        <source src="https://websites.godaddy.com/categories/v4/videos/raw/video/uA41GmyyG8IMaxXdb" type="video/mp4" />
      </video>

      <div
        className="relative container flex flex-col items-center justify-center md:flex-row text-left px-6"
        id="content"
      >

        <div className=" flex flex-col justify-center items-center">
          <h1
            className="text-6xl pt-20 lg:text-8xl text-primary md:text-7xl font-bold mb-6 tracking-tighter animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            LaunchX
          </h1>

          <p
            className="lg:text-xl md:text-lg text-center text-tertiary mb-12 max-w-2xl animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            Own a stake in the future of the space economy. LAUNCH X Coin ($LX) combines scarcity-driven tokenomics, strategic rewards, and community alignment to create a powerful digital asset.
          </p>

          <div
            className="flex flex-col md:flex-row justify-center items-center gap-7 mb-16 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >


            <button
              onClick={() => window.open("/whitepaper.pdf", "_blank")}
              className="group cursor-pointer w-60 h-16 rounded-full font-medium text-lg hover:text-tertiary transition-all inline-flex items-center justify-center gap-2 border-2 border-primary bg-secondary/20 text-primary hover:scale-105 active:scale-95"
            >
              White Paper
              <ArrowRight className="w-5 h-5 mt-1.5 group-hover:translate-x-1 transition-transform" />
            </button>


            <button onClick={() => handleScrollIntoView("#presale")} className="group cursor-pointer hover:text-white w-60 h-16 bg-primary hover:scale-105 active:scale-95 rounded-full font-medium text-lg text-secondary transition-all inline-flex items-center justify-center gap-2 border-2 border-primary">
              Start Presale
            </button>
          </div>

          <CountDown remainingTime={secondsLeft} />
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
