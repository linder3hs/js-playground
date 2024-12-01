export function ComparisonSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          The Best Choice for Developers
        </h2>
        <div className="grid lg:grid-cols-3 gap-8">
          {[
            {
              title: "Traditional IDEs",
              features: [
                "❌ Heavy setup required",
                "❌ System-specific",
                "❌ Resource intensive",
                "❌ Complex configuration",
              ],
              highlighted: false,
            },
            {
              title: "Our Playgrounds",
              features: [
                "✨ Instant start",
                "✨ Run anywhere",
                "✨ Lightning fast",
                "✨ Zero configuration",
              ],
              highlighted: true,
            },
            {
              title: "Online Editors",
              features: [
                "❌ Limited features",
                "❌ Slow performance",
                "❌ Basic editing",
                "❌ Limited language support",
              ],
              highlighted: false,
            },
          ].map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-xl ${
                plan.highlighted
                  ? "bg-gradient-to-b from-orange-500/20 to-purple-500/20 border-2 border-orange-500/50"
                  : "bg-[#1C2333] border border-gray-800"
              }`}
            >
              <h3 className="text-xl font-semibold mb-6 text-center">
                {plan.title}
              </h3>
              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
