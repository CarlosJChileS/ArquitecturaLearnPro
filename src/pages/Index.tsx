import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CourseCatalog from "@/components/CourseCatalog";
import PricingPlans from "@/components/PricingPlans";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <CourseCatalog />
      <PricingPlans />
    </div>
  );
};

export default Index;
