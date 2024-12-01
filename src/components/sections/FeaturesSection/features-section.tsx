import { Zap, Share2, Code2, Laptop } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0E1525] to-[#1C2333]">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Why Choose Our Playgrounds?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: <Zap className="w-6 h-6 text-yellow-400" />,
              title: "Instant Execution",
              description:
                "Write and run code instantly without any setup or configuration.",
            },
            {
              icon: <Share2 className="w-6 h-6 text-blue-400" />,
              title: "Easy Sharing",
              description:
                "Share your code with others using a simple URL. Perfect for collaboration.",
            },
            {
              icon: <Code2 className="w-6 h-6 text-green-400" />,
              title: "Multiple Languages",
              description:
                "Support for various programming languages with syntax highlighting.",
            },
            {
              icon: <Laptop className="w-6 h-6 text-purple-400" />,
              title: "Cross-Platform",
              description: "Access your playgrounds from any device, anywhere.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="relative p-6 bg-[#1C2333] rounded-xl border border-gray-800 hover:border-gray-700 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gray-800 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
