import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CountDown from "./CountDown";
import { PRESALE_PROGRAM_ID } from "../../utilities/config";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Presale } from '@meteora-ag/presale';
import { useState } from "react";
import useTimeStore from "../../utilities/store/TimeStore";
import { useConnection } from "@solana/wallet-adapter-react";

const Hero = () => {
  const containerRef = useRef(null);
  const { connection } = useConnection();
  const [timeLeft,setTimeLeft] = useState(null);
  const {timeOver,presaleProgress,updateAll,vestingOver,prealeVaultPda} = useTimeStore();
  const [timeLeftPresale,setTimeLeftPresale] = useState(null);

  const handleScrollIntoView = (id) => {
    const element = document.querySelector(id);
    element.scrollIntoView({ behavior: "smooth" });
  };

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7; // 👈 slower (0.5x)
    }
  }, []);

  useEffect(() => {
    if(!prealeVaultPda){
      return;
    }
    fetchClaimableAmount();
  }, [prealeVaultPda]);

  const fetchClaimableAmount = async () => {
    try {

      const presaleInstance = await Presale.create(
        connection,
        new PublicKey(prealeVaultPda),  // vault/presale address
        new PublicKey(PRESALE_PROGRAM_ID)  // PRESALE_PROGRAM_ID
      );
      const decimals = 9;

      const presaleData = await presaleInstance.getParsedPresale();
      

      const endTime = presaleData.presaleAccount.presaleEndTime.toString();

      const secondsLeft = Math.floor((endTime * 1000 - Date.now()) / 1000);

      const startTime = presaleData.presaleAccount.presaleStartTime.toString();

      const secondsLeftStart = Math.floor((startTime * 1000 - Date.now()) / 1000);

      if(secondsLeftStart <= 0){
        setTimeLeftPresale(0);
      }else{
        setTimeLeftPresale(secondsLeftStart);
      }

      // const vestingEndTime = presaleData.presaleAccount.presaleEndTime.toString();

      // const vestingSecondsLeft = Math.floor((endTime * 1000 - Date.now()) / 1000);

      if(secondsLeft <= 0){
        setTimeLeft(0);
      }else{
        setTimeLeft(secondsLeft);
      }
      
    } catch (error) {
      
    }
  }

  useEffect(() => {
    if (presaleProgress === 2) {
      setTimeLeft(null); // ✅ clear stale presale time before fetching vesting time
      setTimeout(() => {
        fetchVestingTime();
      }, 3000);
    }
    if(presaleProgress == 3){
      setTimeLeft(0);
    }
  }, [presaleProgress]);

  const fetchVestingTime = async() => {

    if(presaleProgress == 3 && timeOver && vestingOver){
      setTimeLeft(0);
      return;
    }
    
    const presaleInstance = await Presale.create(
        connection,
        new PublicKey(prealeVaultPda),  // vault/presale address
        new PublicKey(PRESALE_PROGRAM_ID)  // PRESALE_PROGRAM_ID
      );
      const decimals = 9;

      const presaleData = await presaleInstance.getParsedPresale();
      

      const vestingEndTime = presaleData.presaleAccount.vestingEndTime.toString();

      const vestingSecondsLeft = Math.floor((vestingEndTime * 1000 - Date.now()) / 1000);

      
      

      if(vestingSecondsLeft <= 0){
        setTimeLeft(0);
      }else{
        setTimeLeft(vestingSecondsLeft);
      }
  }

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
            A deflationary token powered by real market activity. <br />
            Trading volume generates yield → yield funds buybacks → buybacks permanently reduce supply.

          </p>

          <div
            className="flex flex-col md:flex-row justify-center items-center gap-7 mb-16 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >


            <button
              onClick={() => window.open("/whitepaper.pdf", "_blank")}
              className="group cursor-pointer w-52 h-14 rounded-full font-medium text-lg hover:text-tertiary transition-all inline-flex items-center justify-center gap-2 border-2 border-primary bg-secondary/20 text-primary hover:scale-105 active:scale-95"
            >
              Read WhitePaper
            </button>

            <button className="group cursor-pointer hover:text-white w-52 h-14 bg-primary hover:scale-105 active:scale-95 rounded-full font-medium text-lg text-secondary transition-all inline-flex items-center justify-center gap-2 border-2 border-primary"
              onClick={()=>{window.open("https://x.com/bobfraser922","_blank")}}
            >
              Join Community
            </button>
            <button
              onClick={() => handleScrollIntoView("#tokenomics")}
              className="group cursor-pointer w-52 h-14 rounded-full font-medium text-lg hover:text-tertiary transition-all inline-flex items-center justify-center gap-2 border-2 border-primary bg-secondary/20 text-primary hover:scale-105 active:scale-95"
            >
              Tokenomics
            </button>
          </div>

          {prealeVaultPda && <h1 className="text-2xl font-bold mb-6">{presaleProgress == 0 ? "Presale Starts In" : !timeOver ? "Presale Ends In" : vestingOver ? "Vesting Ended" : "Vesting Ends In"}</h1>}
          {!prealeVaultPda && <h1 className="text-2xl font-bold mb-6">PRESALE HAS NOT STARTED YET!</h1>}

          {((presaleProgress == 1) && prealeVaultPda) && <CountDown remainingTime={timeLeft} type="presale"/>}
          {((presaleProgress == 2 || presaleProgress == 3) && prealeVaultPda) && <CountDown remainingTime={timeLeft} type="vesting"/>}
          {((presaleProgress == 0) && prealeVaultPda) && <CountDown remainingTime={timeLeftPresale} type="presale-not-started"/>}
        </div>
      </div>
 
      <style jsx="true">{`
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