"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// zod and rfh
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// icons
import { Eye, EyeOff } from "lucide-react";

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
  type NewPasswordFormSchemaType,
  NewPasswordFormSchema,
} from "~/zodSchema/auth";

interface NewPasswordFormProps {
  token: string;
}

export const NewPasswordForm: React.FC<NewPasswordFormProps> = ({ token }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<NewPasswordFormSchemaType>({
    resolver: zodResolver(NewPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: NewPasswordFormSchemaType) => {
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    setIsLoading(true);

    const { data, error } = await authClient.resetPassword({
      newPassword: values.password,
      token: token,
    });

    if (error || !data) {
      console.error("[Auth] Error resetting password", error);
      toast.error(error?.message || "Failed to reset password");
      setIsLoading(false);
      return;
    }

    toast.success("Password reset successfully! Redirecting to login...");

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  if (!token) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push("/reset-password")}
            className="w-full"
          >
            Request new reset link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
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
                        {showPassword ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...field}
                        disabled={isLoading || form.formState.isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading || form.formState.isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={isLoading || form.formState.isSubmitting}
              className="w-full"
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};
