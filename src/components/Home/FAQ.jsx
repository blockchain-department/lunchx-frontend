import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const FAQ = () => {
  const faqs = [
  {
    question: "What is Launch X Coin ($LX)?",
    answer:
      "Launch X Coin ($LX) is a Solana-based token built around a scarcity-driven economy, combining structured tokenomics, presale mechanics, and long-term holder rewards.",
  },
  {
    question: "How does the presale work?",
    answer:
      "The presale is offered at $0.015 per token, with 75% of tokens unlocked at launch and the remaining 25% released after a 15-day lock period.",
  },
  {
    question: "When will I receive my tokens?",
    answer:
      "Presale participants receive 75% of their tokens at launch, while the remaining 25% becomes claimable after the 15-day lock period ends.",
  },
  {
    question: "What is the Genesis Drop reward?",
    answer:
      "The Genesis Drop distributes 1,000,000 tokens to eligible holders who maintain their full balance for 30 days after launch without selling.",
  },
  {
    question: "What is the Lunar Cycle reward system?",
    answer:
      "The Lunar Cycle distributes 1,000,000 tokens monthly for 12 months, based on holder snapshots taken before each reward cycle.",
  },
  {
    question: "What happens if I sell my tokens early?",
    answer:
      "If you sell even one token before the required holding period, you may lose eligibility for certain rewards like the Genesis Drop.",
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

  console.log(faqToggle);

  return (
    <div className="py-16 px-6 w-full flex items-center justify-center text-secondary bg-[#072542]">
      <div className="container flex md:flex-row flex-col items-start justify-between">
        <div className="font-bold md:text-[48px] text-[36px] leading-10 md:w-[50%] w-full mb-2.5">
          <h1 className="text-[0.5em] textoutline-light">FAQ</h1>
          <h1 className="text-white textoutline-light">Expecting questions, we answer</h1>
        </div>
        <div className="md:w-[50%] w-full">
          {faqs.map((item, key) => {
            return (
              <div key={key} className="flex flex-col border-b">
                <div
                  className="lg:text-[30px] text-[26px] py-2.5 font-semibold flex items-center justify-between cursor-pointer"
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
                  <FaChevronDown
                    className={`transition-all duration-700 ${faqToggle[key] ? "rotate-180" : "rotate-0"}`}
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
                    lg:text-[20px] text-[18px]
                    overflow-hidden
                    
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
