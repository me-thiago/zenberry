import { Check, X } from "lucide-react";
import Image from "next/image";

const FEATURES = [
  { name: "Natural Ingredients", zenberry: true, others: false },
  { name: "Third-Party Testing", zenberry: true, others: false },
  { name: "US Hemp Authority Certified", zenberry: true, others: false },
  { name: "Customer Satisfaction", zenberry: true, others: false },
];

const BADGES = [
  "Grown in USA",
  "Gluten-Free",
  "Non-GMO",
  "Customer Satisfaction",
];

export function ProductByIdComparison() {
  return (
    <div className="my-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start px-4">
      {/* Left Side - Title and Badges */}
      <div className="text-center lg:text-start">
        <h2 className="text-3xl md:text-4xl font-bold text-theme-accent-secondary mb-6">
          Zenberry vs
          <br />
          Competitors.
        </h2>
        <div className="space-y-3">
          {BADGES.map((badge, index) => (
            <div
              key={index}
              className="flex items-center justify-center lg:justify-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-theme-accent-primary flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-theme-text-primary font-medium">
                {badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Comparison Table */}
      <div className="bg-gray-50 rounded-xl shadow-lg overflow-hidden border border-black">
        {/* Table Header */}
        <div className="grid grid-cols-3 border-b border-black">
          <div className="px-6 py-4 border-r border-black"></div>
          <div className="px-6 py-4 border-r border-black flex">
            <Image
              src="/logo-zenberry-black.webp"
              alt="Zenberry"
              width={110}
              height={80}
              className="m-auto hidden sm:block"
              priority
            />
            <Image
              src="/logo-zenberry-icon.webp"
              alt="Zenberry"
              width={50}
              height={80}
              className="m-auto block sm:hidden"
              priority
            />
          </div>
          <div className="px-6 py-4 flex justify-center items-center">
            <span className="font-semibold text-theme-text-primary text-sm md:text-base block text-center">
              Others Brands
            </span>
          </div>
        </div>

        {/* Table Rows */}
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className={`grid grid-cols-3 ${
              index !== FEATURES.length - 1 ? "border-b border-black" : ""
            }`}
          >
            {/* Feature Name Column */}
            <div className="px-4 md:px-6 py-4 flex items-center border-r border-black">
              <span className="text-xs md:text-sm font-medium">
                {feature.name}
              </span>
            </div>

            {/* Zenberry Column */}
            <div className="px-6 py-4 border-r border-black flex items-center justify-center">
              {feature.zenberry ? (
                <div className="w-6 h-6 rounded-full bg-theme-accent-primary flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Others Column */}
            <div className="px-6 py-4 flex items-center justify-center">
              {feature.others ? (
                <div className="w-6 h-6 rounded-full bg-theme-accent-primary flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
