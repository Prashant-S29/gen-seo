"use client";

import React, { useState } from "react";
import Link from "next/link";

// zod and rfh
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// icons
import { ChevronLeft } from "lucide-react";

// components
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";

// auth client
import { authClient } from "~/server/better-auth/client";
import {
  ResetPasswordSchema,
  type ResetPasswordSchemaType,
} from "~/zodSchema/auth";

export const PasswordResetForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ResetPasswordSchemaType) => {
    setIsLoading(true);

    const { data, error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/new-password",
    });

    if (error || !data) {
      console.error("[Auth] Error requesting password reset", error);
      toast.error(error?.message || "Failed to send reset email");
      setIsLoading(false);
      return;
    }

    toast.success("Password reset email sent! Check your inbox.");
    setEmailSent(true);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  if (emailSent) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              If your email address is registered, we&apos;ve sent a password
              reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/login">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="me@example.com"
                        {...field}
                        disabled={isLoading || form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/login">
                    <ChevronLeft />
                    Back to login
                  </Link>
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || form.formState.isSubmitting}
                  className="w-full"
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
};
