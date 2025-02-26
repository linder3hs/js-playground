"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";

// Definir interfaces para las props y datos
interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
  index: number;
}

interface FAQData {
  question: string;
  answer: string;
}

const FAQItem = ({
  question,
  answer,
  isOpen,
  toggleOpen,
  index,
}: FAQItemProps) => {
  return (
    <motion.div
      className={`border-b border-gray-200 dark:border-gray-800 last:border-0 ${
        isOpen ? "pb-6" : "pb-4"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <button
        className="py-4 flex items-center justify-between w-full text-left"
        onClick={toggleOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-gray-600 dark:text-gray-300">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const faqs: FAQData[] = [
    {
      question: "Is it really free?",
      answer:
        "Yes! JS Playground is completely free to use and open source. We believe in providing accessible tools for developers of all levels. There are no hidden fees, subscriptions, or premium features locked behind a paywall.",
    },
    {
      question: "Can I save my code?",
      answer:
        "Absolutely. All your code is automatically saved to your browser's local storage, so you can close your browser and come back later without losing your work. For more permanent storage and sharing, you can create an account which allows you to save your projects to the cloud.",
    },
    {
      question: "How do I share my playground?",
      answer:
        "Sharing is simple! Just click the &apos;Share&apos; button in the top menu bar of any playground to generate a unique URL. You can send this link to anyone, and they&apos;ll be able to see and run your exact code. You can also set permissions to allow others to edit your code for collaborative work.",
    },
    {
      question: "What about data privacy?",
      answer:
        "Your privacy is important to us. Your code is private by default and only accessible to those you explicitly share it with. We do not analyze, sell, or share your code with third parties. You maintain full ownership and control over everything you create.",
    },
    {
      question: "Can I use external libraries and packages?",
      answer:
        "Yes, you can! JS Playground supports importing popular libraries via CDN. For JavaScript and TypeScript playgrounds, you can use npm packages directly by importing them. We're constantly expanding our library support based on community feedback.",
    },
    {
      question: "Does it work offline?",
      answer:
        "While JS Playground is primarily a web-based tool, we do implement service workers that allow for limited offline functionality. Once you've loaded the app, you can continue working on your current project even if your internet connection drops temporarily.",
    },
    {
      question: "How do I contribute to the project?",
      answer:
        "We welcome contributions! JS Playground is open source and hosted on GitHub. You can contribute by submitting pull requests, reporting bugs, suggesting features, or improving documentation. Check out our GitHub repository and the &apos;Contributing&apos; guide to get started.",
    },
    {
      question: "Is there a limit to project size or complexity?",
      answer:
        "While JS Playground is designed to handle most common development scenarios, extremely large projects might experience performance issues in the browser environment. For complex, multi-file projects, we recommend our project export feature that allows you to continue development in your local environment.",
    },
  ];

  return (
    <section className="py-24 bg-[#1C2333] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-400 border border-blue-900/30 mb-4">
            Common Questions
          </span>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-300">
            Everything you need to know about the JS Playground platform
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 md:p-8">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  toggleOpen={() =>
                    setOpenIndex(openIndex === index ? -1 : index)
                  }
                  index={index}
                />
              ))}
            </div>
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
              <MessageCircle className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">
                Still have questions?
              </h3>
              <p className="text-gray-300 mb-4">
                Can&apos;t find the answer you&apos;re looking for? Please reach
                out to our friendly team.
              </p>
              <motion.a
                href="/contact"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Support
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
