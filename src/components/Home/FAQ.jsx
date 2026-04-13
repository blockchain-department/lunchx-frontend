import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = () => {
const faqs = [
  {
    question: "What is LaunchX Coin ($LX)?",
    answer:
      "LaunchX is a deflationary Solana token built around a system where trading activity generates yield, which funds buybacks and permanently reduces supply.",
  },
  {
    question: "How does the presale work?",
    answer:
      "The presale offers early access to $LX at $0.00420 before the public launch at $0.010. Participants receive tokens at launch and may qualify for a 15% bonus.",
  },
  {
    question: "When will I receive my tokens?",
    answer:
      "Presale tokens are distributed at launch. Bonus tokens are allocated after the 30-day holding requirement is met.",
  },
  {
    question: "How does the Buyback & Burn Engine work?",
    answer:
      "Trading activity generates fees through liquidity. These fees are used to buy $LX on the open market, and those tokens are permanently burned.",
  },
  {
    question: "How are rewards distributed?",
    answer:
      "120 million tokens are distributed over 12 months through randomized snapshots. Eligibility requires maintaining your token balance and meeting holding criteria.",
  },
  {
    question: "What are the 30-day holding requirements?",
    answer:
      "Presale participants must hold for 30 days to receive the 15% bonus. Early selling results in forfeiture and burn of the bonus tokens.",
  },
  {
    question: "How is liquidity managed?",
    answer:
    "Liquidity is deployed through Meteora DLMM, allowing capital to concentrate around active price ranges for efficiency and yield generation.",
  },
  {
    question: "Is the team allocated tokens?",
    answer:
    "No. There is no dedicated team token allocation. A portion of presale proceeds supports operations and long-term sustainability.",
  },
  {
    question:"What risks should I understand?",
    answer:
    "$LX is a speculative digital asset. Risks include volatility, liquidity dynamics, and dependence on trading activity for buybacks",
  },
];
  const [faqToggle, setFaqToggle] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  

  return (
    <div className="py-10 px-6 w-full flex items-center justify-center text-secondary bg-secondary">
      <div className="container flex md:flex-row flex-col items-start justify-between">
        <div className="font-semibold md:text-[44px] text-[32px] leading-10 md:w-[50%] w-full mb-2.5">
          <h1 className="text-[0.5em] textoutline-light text-primary">FAQ</h1>
          <h1 className="text-tertiary textoutline-light">Clear answers on token mechanics, rewards, and liquidity strategy.</h1>
        </div>
        <div className="md:w-[50%] w-full">
          {faqs.map((item, key) => {
            return (
              <div key={key} className="text-tertiary flex flex-col border-b">
                <div
                  className="lg:text-[24px] text-[20px] py-2.5 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setFaqToggle((prev) => {
                      const allFalse = Object.fromEntries(
                        faqs.map((_, i) => [i, false]),
                      );
                      return { ...allFalse, [key]: !prev[key] };
                    })
                  }
                >
                  <h1>{item.question}</h1>
                  <ChevronDown
                    className={`text-primary ${faqToggle[key] ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
                <div
                  className={`
                    ${faqToggle[key] ? "max-h-96" : "max-h-0"}
                    flex
                    w-full
                    flex-col
                    transition-all duration-1000
                    origin-top
                    lg:text-[18px] text-[12px]
                    overflow-hidden
                    pb-1
                  `}
                >
                  <h1>{item.answer}</h1>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
