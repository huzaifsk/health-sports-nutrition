import { FlaskConical, ShieldCheck, Truck, Wallet } from "lucide-react";

const benefits = [
  { icon: FlaskConical, title: "Quality Ingredients", description: "Batch-tested for purity and label accuracy." },
  { icon: ShieldCheck, title: "Secure Payments", description: "Every order is encrypted end to end." },
  { icon: Truck, title: "Fast Delivery", description: "Pan-India shipping, free above ₹1,999." },
  { icon: Wallet, title: "Transparent Pricing", description: "No hidden costs, MRP includes GST." },
];

export function BrandBenefits() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="flex flex-col items-center gap-2 text-center">
            <benefit.icon className="size-5 text-brand-foreground" />
            <h3 className="text-sm font-medium">{benefit.title}</h3>
            <p className="text-xs text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
