export function WebsiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Code Playground",
          applicationCategory: "DeveloperApplication",
          browserRequirements: "Requires JavaScript. Requires HTML5.",
          description:
            "A modern playground for multiple programming languages including JavaScript, TypeScript, and Swift.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          operatingSystem: "All",
          url: "https://js-playground-alpha.vercel.app",
          features: [
            "Multiple programming language support",
            "Real-time code execution",
            "Code sharing capabilities",
            "Syntax highlighting",
            "Auto-save functionality",
          ],
          availableLanguage: ["JavaScript", "TypeScript", "Swift"],
        }),
      }}
    />
  );
}
