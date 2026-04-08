import React, { useEffect, useRef, useState } from "react";
import { Film, ArrowRight, Sparkles, Lock, Globe, Zap } from "lucide-react";
import { NavLink } from "react-router";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
import { contract_address, network } from "../utilities/config.js";
import { solana, solanaDevnet, solanaTestnet } from "@reown/appkit/networks";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { open, close } = useAppKit();
  const { address, isConnected, caipAddress, status, embeddedWalletInfo } =
    useAppKitAccount();
  const { caipNetwork, caipNetworkId, chainId, switchNetwork } =
    useAppKitNetwork();
  const [parsedToken, setParsedToken] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const percentage = (scrollTop / docHeight) * 100;
      setProgress(Math.min(percentage, 100));

      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollIntoView = (id) => {
    const element = document.querySelector(id);
    element.scrollIntoView({ behavior: "smooth" });
  };

  const connectWallet = async () => {
    if (isConnected) {
      open({ view: "Account" });
    } else {
      open({ view: "Connect", namespace: "solana" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-[#072542]/60 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="container sm:px-0 px-6 mx-auto py-5">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 hover:cursor-pointer"
            onClick={() => handleScrollIntoView("#hero")}
          >
            <div className=" rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-cover" />
            </div>
            <span className="sm:text-lg text-base text-white font-medium tracking-tight">
              LaunchX
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <h1
              onClick={() => handleScrollIntoView("#about")}
              to="#about"
              className="hover:cursor-pointer hover:text-lg hover:text-[#E8BE04] text-sm text-white transition-colors font-semibold"
            >
              About
            </h1>
            <h1
              onClick={() => handleScrollIntoView("#tokenomics")}
              to="#tokenomics"
              className="hover:cursor-pointer text-sm hover:text-lg text-white hover:text-[#E8BE04] transition-colors font-semibold"
            >
              Token
            </h1>
            <h1
              onClick={() => handleScrollIntoView("#roadmap")}
              to="#roadmap"
              className="hover:cursor-pointer text-sm hover:text-lg text-white hover:text-[#E8BE04] transition-colors font-semibold"
            >
              Roadmap
            </h1>

            <h1
              onClick={() => handleScrollIntoView("#presale")}
              to="#holdings"
              className="hover:cursor-pointer text-sm hover:text-lg hover:text-[#E8BE04] text-white transition-colors font-semibold"
            >
              Presale
            </h1>
          </nav>

          <div className="flex  items-center justify-between gap-2 ">
            <button
              className="bg-white text-black px-5 py-2.5 rounded-full border-none text-sm font-medium hover:bg-[#E8BE04] transition-all hover:cursor-pointer"
              onClick={() => connectWallet()}
            >
              {isConnected
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Connect"}
               
            </button>
          </div>
        </div>
      </div>
      <div
        className="bg-[#E8BE04] h-px"
        style={{ width: `${progress}%` }}
      ></div>
    </header>
  );
};

export default Header;
