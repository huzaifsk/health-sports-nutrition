"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCustomerStore } from "@/lib/customer-store";

const profileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm({ mode }: { mode: "setup" | "edit" }) {
  const profile = useCustomerStore((state) => state.profile);
  const setProfile = useCustomerStore((state) => state.setProfile);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
    },
  });

  function onSubmit(values: ProfileFormValues) {
    setProfile({ ...values, addresses: profile?.addresses ?? [] });
    toast.success(mode === "setup" ? "Welcome! Your account is set up." : "Profile updated.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-sm flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
          <Input id="profile-name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-email">Email</FieldLabel>
          <Input id="profile-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
          <Input id="profile-phone" inputMode="numeric" {...register("phone")} aria-invalid={!!errors.phone} />
          <FieldError errors={[errors.phone]} />
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-fit">
        {mode === "setup" ? "Continue" : "Save changes"}
      </Button>
    </form>
  );
}
