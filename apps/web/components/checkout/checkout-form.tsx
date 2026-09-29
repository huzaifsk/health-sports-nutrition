"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/lib/cart-store";
import { useCustomerStore } from "@/lib/customer-store";
import { useOrdersStore } from "@/lib/orders-store";
import { placeOrderAction } from "@/app/checkout/actions";

const checkoutSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  line1: z.string().min(4, "Enter your address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  paymentMethod: z.enum(["card", "upi", "cod"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const customerProfile = useCustomerStore((state) => state.profile);
  const setProfile = useCustomerStore((state) => state.setProfile);
  const addOrder = useOrdersStore((state) => state.addOrder);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const savedAddress = customerProfile?.addresses[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: customerProfile?.name ?? "",
      email: customerProfile?.email ?? "",
      phone: customerProfile?.phone ?? "",
      line1: savedAddress?.line1 ?? "",
      line2: savedAddress?.line2 ?? "",
      city: savedAddress?.city ?? "",
      state: savedAddress?.state ?? "",
      pincode: savedAddress?.pincode ?? "",
      paymentMethod: "upi",
    },
  });

  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  async function onSubmit(values: CheckoutFormValues) {
    if (cart.items.length === 0) return;
    setIsSubmitting(true);

    const shippingAddress = {
      fullName: values.name,
      phone: values.phone,
      line1: values.line1,
      line2: values.line2 ?? "",
      city: values.city,
      state: values.state,
      pincode: values.pincode,
    };

    setProfile({
      name: values.name,
      email: values.email,
      phone: values.phone,
      addresses: [shippingAddress],
    });

    const result = await placeOrderAction({
      cart,
      customerName: values.name,
      customerEmail: values.email,
      phone: values.phone,
      address: { line1: values.line1, line2: values.line2 ?? "", city: values.city, state: values.state, pincode: values.pincode },
      paymentMethod: values.paymentMethod,
    });

    if (!result.success) {
      setIsSubmitting(false);
      toast.error(result.error);
      return;
    }

    // Real order now exists in WooCommerce (visible in wp-admin and the
    // admin app) — mirror it locally too, using WooCommerce's own order
    // number/id/total, for the account order-history view.
    const now = new Date().toISOString();
    addOrder({
      id: String(result.orderId),
      orderNumber: result.orderNumber,
      customerName: values.name,
      customerEmail: values.email,
      shippingAddress,
      items: cart.items.map((item) => ({
        productId: item.productId,
        variationId: item.variationId,
        slug: item.slug,
        name: item.name,
        image: item.image,
        categorySlug: item.categorySlug,
        sku: item.sku,
        attributes: item.attributes,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totals: { ...cart.totals, total: result.total },
      currency: "INR",
      couponCode: cart.couponCode,
      paymentMethod: values.paymentMethod,
      paymentStatus: values.paymentMethod === "cod" ? "pending" : "paid",
      paymentTransactionId: null,
      orderStatus: "processing",
      timeline: [
        { status: "placed", timestamp: now },
        { status: "processing", timestamp: now },
      ],
      createdAt: now,
    });

    clearCart();
    toast.success("Order placed successfully!");
    router.push(`/orders/${result.orderNumber}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Contact Information</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input id="name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" autoComplete="tel" inputMode="numeric" {...register("phone")} aria-invalid={!!errors.phone} />
            <FieldError errors={[errors.phone]} />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
            <FieldError errors={[errors.email]} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Shipping Address</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="line1">Address line 1</FieldLabel>
            <Input id="line1" autoComplete="address-line1" {...register("line1")} aria-invalid={!!errors.line1} />
            <FieldError errors={[errors.line1]} />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="line2">Address line 2 (optional)</FieldLabel>
            <Input id="line2" autoComplete="address-line2" {...register("line2")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" autoComplete="address-level2" {...register("city")} aria-invalid={!!errors.city} />
            <FieldError errors={[errors.city]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input id="state" autoComplete="address-level1" {...register("state")} aria-invalid={!!errors.state} />
            <FieldError errors={[errors.state]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="pincode">Pincode</FieldLabel>
            <Input id="pincode" inputMode="numeric" autoComplete="postal-code" {...register("pincode")} aria-invalid={!!errors.pincode} />
            <FieldError errors={[errors.pincode]} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Payment Method</FieldLegend>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setValue("paymentMethod", value as CheckoutFormValues["paymentMethod"])}
          className="gap-3"
        >
          {[
            { value: "upi", label: "UPI", hint: "Pay via any UPI app" },
            { value: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay" },
            { value: "cod", label: "Cash on Delivery", hint: "Pay when your order arrives" },
          ].map((option) => (
            <label
              key={option.value}
              htmlFor={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 has-data-checked:border-foreground"
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.hint}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </FieldSet>

      <p className="text-xs text-muted-foreground">
        This is a demo checkout — payments are simulated and no real transaction occurs.
      </p>

      <Button type="submit" size="lg" className="w-full bg-brand text-brand-foreground hover:bg-brand/90" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Processing payment…
          </>
        ) : (
          "Place Order"
        )}
      </Button>
    </form>
  );
}
