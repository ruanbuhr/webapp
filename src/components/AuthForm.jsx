"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tab, setTab] = useState("sign-in");
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      router.push("/"); // after sign in, go to '/'
    }
  };

  const handleEmailSignUp = async () => {
    setLoading(true);

    if (password != confirmPassword) {
      alert("Passwords don't match");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Account created.");
      setTab("sign-in");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <Image
        src="/shopleft-logo.png"
        alt="ShopLeft"
        width={200}
        height={80}
        className="mb-8"
      />

      <Card className="w-full max-w-md shadow-lg">
        <Tabs
          defaultValue="sign-in"
          value={tab}
          onValueChange={(value) => {
            setTab(value);
            setEmail("");
            setPassword("");
            setConfirmPassword("");
          }}
          className="flex flex-col items-center"
        >
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in">
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full mt-8"
                onClick={handleEmailSignIn}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </CardContent>
          </TabsContent>

          <TabsContent value="sign-up">
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full mt-8"
                onClick={handleEmailSignUp}
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
