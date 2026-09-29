"use client";

import { LogOut } from "lucide-react";
import { AddressList } from "@/components/account/address-list";
import { OrderList } from "@/components/account/order-list";
import { ProfileForm } from "@/components/account/profile-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerStore } from "@/lib/customer-store";

export default function AccountPage() {
  const profile = useCustomerStore((state) => state.profile);
  const logout = useCustomerStore((state) => state.logout);

  if (!profile) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mb-1 font-heading text-2xl font-semibold tracking-tight">Welcome</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Set up your account to track orders, save addresses, and build a wishlist.
        </p>
        <ProfileForm mode="setup" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Hi, {profile.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut />
          Log out
        </Button>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="pt-6">
          <OrderList />
        </TabsContent>
        <TabsContent value="addresses" className="pt-6">
          <AddressList />
        </TabsContent>
        <TabsContent value="profile" className="pt-6">
          <ProfileForm mode="edit" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
