"use client";

import React, { useState } from "react";
import Link from "next/link";

// zod and rfh
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// icons
import { Eye, EyeOff, Mail } from "lucide-react";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";

// zod schema and types
import { SignupFormSchema, type SignupFormSchemaType } from "~/zodSchema/auth";

// auth client
import { authClient } from "~/server/better-auth/client";

export const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<SignupFormSchemaType>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignupFormSchemaType) => {
    setIsLoading(true);
    const res = await authClient.signUp.email({
      ...values,
      callbackURL: "/welcome",
    });

    if (res.error || !res.data) {
      console.error("[Auth] Error signing up with email", res.error);
      toast.error(res.error.message);
      setIsLoading(false);
      return;
    }

    // Show verification email sent state
    setUserEmail(values.email);
    setVerificationEmailSent(true);
    toast.success("Verification email sent!");
    setIsLoading(false);
  };

  const handleSocialSignup = async (provider: "github" | "google") => {
    setIsLoading(true);
    const res = await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
      newUserCallbackURL: "/welcome",
    });

    if (res.error || !res.data) {
      console.error("[Auth] Error logging in with social provider", res.error);
      toast.error(res.error.message);
      setIsLoading(false);
      return;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  if (verificationEmailSent) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="bg-primary/10 rounded-full p-3">
              <Mail className="text-primary h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a verification link to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-sm font-medium break-all">
              {userEmail}
            </p>
            <p className="text-muted-foreground text-center text-sm">
              Click the verification link in the email to activate your account.
              If you don&apos;t see it, check your spam folder.
            </p>
            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setVerificationEmailSent(false);
                  form.reset();
                }}
              >
                Use a different email
              </Button>
              <p className="text-muted-foreground text-center text-xs">
                Already verified?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Signup to your account</CardTitle>
        <CardDescription>
          Enter your email below to Signup to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="James"
                      {...field}
                      disabled={isLoading || form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                        disabled={isLoading || form.formState.isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || form.formState.isSubmitting}
                      >
                        {showPassword ? <Eye /> : <EyeOff />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || form.formState.isSubmitting}
              >
                {isLoading && form.formState.isSubmitting
                  ? "Creating account..."
                  : "Signup"}
              </Button>

              <div className="my-4 flex items-center justify-center gap-2">
                <div className="bg-border h-px w-full" />
                <p className="text-muted-foreground/70 text-xs whitespace-nowrap">
                  Or continue with
                </p>
                <div className="bg-border h-px w-full" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleSocialSignup("google")}
                  disabled={isLoading || form.formState.isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleSocialSignup("github")}
                  disabled={isLoading || form.formState.isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      fill="currentColor"
                    />
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>
            <FormDescription className="text-center">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Login
              </Link>
            </FormDescription>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};
