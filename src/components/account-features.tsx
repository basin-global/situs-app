'use client'

import Image from 'next/image';

interface AccountFeaturesProps {
  ogName: string;
  tagline?: string;
}

export const AccountFeatures: React.FC<AccountFeaturesProps> = ({ ogName, tagline }) => {
  const features = [
    {
      title: "Receive, Send & Share All Forms of Value",
      subtitle: "Flows of Value Across Boundaries",
      description: "Seamlessly receive, send, and share flows of diverse value types—financial, economic, cultural, social, aesthetic, intrinsic, and relational—all within your account.",
      icon: "valuable.png"
    },
    {
      title: "Unlimited Use Cases & Applications",
      subtitle: "Flexibility for People, Place & Purpose",
      description: "Your account isn't confined by specific use cases—represent yourself, a place, or a purpose. Each account adapts to your identity and intention, fitting seamlessly into an array of applications.",
      icon: "adaptive.png"
    },
    {
      title: "Timeless Ownership, No Renewals",
      subtitle: "One-Time Purchase",
      description: "Once you own it, it's yours—no renewal fees, and no limit to the number of accounts you can hold or the groups you can join. Hold long-term as a secure asset or leverage for speculation.",
      icon: "legacy.png"
    },
    {
      title: "Composable & Interoperable",
      subtitle: "Designed for the Future",
      description: "Fully composable and interoperable across platforms, your account integrates effortlessly into existing systems and emerging ecosystems, enhancing both its utility and adaptability.",
      icon: "neutral.png"
    },
    {
      title: "Boundless Community Integration",
      subtitle: "Empower and Engage",
      description: "Join and engage with multiple communities and initiatives, adding depth to your interactions. Contribute to shared governance, access exclusive rewards, and benefit from each group's unique perks.",
      icon: "distributed.png"
    },
    {
      title: "Sovereign & Independent",
      subtitle: "Self-Custody and Censorship Resistance",
      description: "Enjoy ultimate freedom with self-custodial ownership, ensuring privacy, security, and resilience across a network unbound by any single platform or authority.",
      icon: "sovereign.png"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg" id="features">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          Ensure Your Legacy With A <span className="og-gradient-text">.{ogName}</span> Account
        </h2>
        {tagline && (
          <p className="text-xl text-gray-600 dark:text-gray-300">
            .<span className="og-gradient-text">{ogName}</span>: {tagline}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="p-6 rounded-lg transition-transform hover:scale-105"
          >
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 relative mr-4 flex-shrink-0">
                <Image
                  src={`/assets/icons/nexus/${feature.icon}`}
                  alt={feature.title}
                  width={48}
                  height={48}
                  className="transition-opacity hover:opacity-80 filter brightness-0 invert-[.7] dark:invert-[1]"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                  {feature.title}
                </h3>
                <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-200">
                  {feature.subtitle}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 