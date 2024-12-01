export function FAQSection() {
  return (
    <section className="py-20 bg-[#1C2333]">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              question: "Is it really free?",
              answer:
                "Yes! Our basic playgrounds are completely free to use. No credit card required.",
            },
            {
              question: "Can I save my code?",
              answer:
                "All your code is automatically saved and can be accessed from anywhere.",
            },
            {
              question: "How do I share my playground?",
              answer:
                "Simply click the share button to get a unique URL for your code.",
            },
            {
              question: "What about data privacy?",
              answer:
                "Your code is private by default. You control what you share.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="p-6 bg-[#0E1525] rounded-xl border border-gray-800 hover:border-gray-700 transition-all"
            >
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
