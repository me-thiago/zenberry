import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { Product } from "@/src/types/product";

interface ProductByIdTabsInfosProps {
  product: Product;
}

export function ProductByIdTabsInfos({ product }: ProductByIdTabsInfosProps) {
  return (
    <Tabs defaultValue="description" className="mt-3">
      <TabsList className="bg-theme-bg-secondary w-full h-auto md:h-12 justify-start border-b border-theme-text-secondary/20 flex-col sm:flex-row items-stretch sm:items-center">
        <TabsTrigger
          value="description"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-theme-accent-secondary text-theme-text-primary w-full sm:w-auto justify-center py-3 sm:py-2"
        >
          Description
        </TabsTrigger>
        <TabsTrigger
          value="ingredients"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-theme-accent-secondary text-theme-text-primary w-full sm:w-auto justify-center py-3 sm:py-2"
        >
          Ingredients
        </TabsTrigger>
        <TabsTrigger
          value="how-to-use"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-theme-accent-secondary text-theme-text-primary w-full sm:w-auto justify-center py-3 sm:py-2"
        >
          How to Use
        </TabsTrigger>
        <TabsTrigger
          value="guarantee"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-theme-accent-secondary text-theme-text-primary w-full sm:w-auto justify-center py-3 sm:py-2"
        >
          Guarantee
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-2 px-4 sm:px-0">
        <div className="max-w-3xl">
          <p className="text-theme-text-secondary leading-relaxed transition-colors duration-200">
            {product.description}
          </p>
          <p className="text-theme-text-secondary leading-relaxed mt-4 transition-colors duration-200">
            Our Sleep Gummies are crafted with premium hemp-derived cannabinoids
            and natural ingredients. Each batch is third-party lab tested to
            ensure purity, potency, and safety. Perfect for those seeking a
            natural solution to occasional sleeplessness.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="ingredients" className="mt-2 px-4 sm:px-0">
        <div className="max-w-3xl text-theme-text-secondary">
          <ul className="space-y-2">
            {" "}
            {product.ingredients &&
              product.ingredients.length > 0 &&
              product.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-theme-text-secondary transition-colors duration-200"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-theme-accent-secondary" />
                  {ingredient}
                </li>
              ))}
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="how-to-use" className="mt-2 px-4 sm:px-0">
        <div className="max-w-3xl">
          <p className="text-theme-text-secondary leading-relaxed mb-4 transition-colors duration-200">
            {product.howToUse} Lorem ipsum dolor sit amet consectetur,
            adipisicing elit. Dignissimos cumque nihil autem, in quasi a
            praesentium? Fugit soluta eligendi mollitia expedita provident
            voluptate ratione magni esse? Quaerat quasi placeat deserunt.
          </p>
          <div className="bg-theme-accent-yellow/10 border border-theme-accent-yellow/30 rounded-lg p-4 mt-6">
            <p className="text-sm text-theme-text-primary transition-colors duration-200">
              <strong>Warning:</strong> This product contains THC. Do not drive
              or operate machinery after use. Keep out of reach of children.
              Consult your physician before use if pregnant or nursing.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="guarantee" className="mt-2 px-4 sm:px-0">
        <div className="w-full text-theme-text-secondary">
          {/* Sample Reviews */}
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Commodi sunt
          rem harum ea, saepe mollitia deserunt doloremque earum accusantium
          similique, perferendis culpa natus odit! Eos laudantium voluptate
          neque natus nostrum?
        </div>
      </TabsContent>
    </Tabs>
  );
}
