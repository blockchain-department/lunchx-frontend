import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useLocation } from "react-router";
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { publicKey , connected } = useWallet();
  const isConnected = connected;
  const address = publicKey?.toBase58();
  const [progress, setProgress] = useState(0);
  const location = useLocation();
  const pathname = location.pathname;

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-secondary/60 backdrop-blur-xl border-b border-tertiary/5"
          : "bg-transparent"
      }`}
    >
      <div className="container sm:px-0 px-6 mx-auto py-2">
        <div className="flex items-center justify-between">
          <a href="https://launchxcoin.io/">
          <div
            className="flex items-center gap-2 hover:cursor-pointer"
            onClick={() => handleScrollIntoView("#hero")}
          >
            <div className=" rounded-xl flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-16 h-16 object-cover"
              />
            </div>
            <span className="sm:text-xl text-base text-tertiary font-medium tracking-tight">
              LaunchX
            </span>
          </div>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            { pathname === "/" ? (
            <h1
              onClick={() => handleScrollIntoView("#about")}
              to="#about"
              className="hover:cursor-pointer hover:scale-120 hover:text-primary text-lg text-tertiary transition-colors font-semibold duration-300"
            >
              About
            </h1> ) : null
            }
            {pathname === "/" ? (
            <h1
              onClick={() => handleScrollIntoView("#tokenomics")}
              to="#tokenomics"
              className="hover:cursor-pointer text-lg hover:scale-120 text-tertiary hover:text-primary transition-colors font-semibold duration-300"
            >
              Tokenomics
            </h1> ) : null
            }
            {pathname === "/" ? ( 
            <h1
              onClick={() => handleScrollIntoView("#roadmap")}
              to="#roadmap"
              className="hover:cursor-pointer text-lg hover:scale-120 text-tertiary hover:text-primary transition-colors font-semibold duration-300"
            >
              Roadmap
            </h1> ) : null
            }
            {pathname === "/" ? (
            <h1
              onClick={() => handleScrollIntoView("#presale")}
              to="#holdings"
              className="hover:cursor-pointer text-lg hover:scale-120 hover:text-primary text-tertiary transition-colors font-semibold duration-300"
            >
              Presale
            </h1> ) : null
            }
          </nav>

          <div className="flex  items-center justify-between gap-2 ">
            {/* <button
              className="hover:scale-105 active:scale-95 text-secondary px-5 py-2.5 rounded-full border-none text-md font-semibold bg-primary hover:text-tertiary duration-300 transition-all hover:cursor-pointer"
              onClick={() => connectWallet()}
            >
              {isConnected
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Connect"}
            </button> */}
            <WalletMultiButton />
          </div>
        </div>
      </div>
      <div className="bg-primary h-px" style={{ width: `${progress}%` }}></div>
    </header>
  );
};

export default Header;
