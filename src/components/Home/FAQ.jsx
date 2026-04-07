import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const FAQ = () => {
  const faqs = [
    {
      question: "What is liquid staking ?",
      answer:
        "Liquid staking allows you to stake your TON tokens and receive STAKED in return. Unlike traditional staking, you can use STAKED in DeFi applications while still earning staking rewards.",
    },
    {
      question: "How do i received my staking reward?",
      answer:
        "Rewards are automatically reflected in the value of your STAKED tokens.",
    },
    {
      question: "is there a Lock-up period?",
      answer:
        "No, there is no lock-up period. You can unstake your TON at any time.",
    },
    {
      question: "What is STAKED",
      answer:
        "STAKED is a liquid staking token that represents your staked TON plus rewards.",
    },
    {
      question: "Is my TON safe?",
      answer:
        "Yes, our smart contracts are audited and the protocol is non-custodial.",
    },
    {
      question: "Where are the fees?",
      answer: "We charge a 10% fee on staking rewards only.",
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
    <div className="pt-16 px-6 w-full flex items-center justify-center text-secondary">
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
                    mb-2
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
