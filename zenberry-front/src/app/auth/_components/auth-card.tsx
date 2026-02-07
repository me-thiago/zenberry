"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import {
  loginSchema,
  type LoginFormData,
} from "@/src/schemas/auth/login-schema";
import { useAuthContext } from "@/src/contexts/auth-context";

export function AuthCard() {
  const { loginWithCredentials } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      try {
        await loginWithCredentials(data);
      } catch (error) {
        console.error("Login error:", error);
        toast.error(error instanceof Error ? error.message : "Login failed");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-2">
      {/* Logo */}
      <div className="text-center mb-8">
        <Image
          src="/logo-zenberry.webp"
          alt="Zenberry"
          width={300}
          height={150}
          className="mx-auto mb-3"
          priority
        />
        <p className="text-white mt-2 transition-colors duration-200">
          Welcome back! Sign in to your account
        </p>
      </div>
      {/* Auth Form Card */}
      <div className="bg-theme-bg-secondary rounded-2xl p-8 shadow-lg transition-colors duration-200 border border-theme-text-secondary/10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-theme-text-primary transition-colors duration-200"
            >
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-secondary" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`pl-10 bg-theme-bg-primary border-theme-text-secondary/20 text-theme-text-primary placeholder:text-theme-text-secondary/50 focus:border-theme-accent-secondary transition-colors duration-200 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-theme-text-primary transition-colors duration-200"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-secondary" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={`pl-10 pr-10 bg-theme-bg-primary border-theme-text-secondary/20 text-theme-text-primary placeholder:text-theme-text-secondary/50 focus:border-theme-accent-secondary transition-colors duration-200 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-secondary hover:text-theme-accent-secondary transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {/* Forgot Password (Login Only) */}
          <div className="flex justify-end">
            <a
              href="https://zenberrynaturals.myshopify.com/account/login#recover"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-theme-accent-secondary hover:underline transition-colors duration-200"
            >
              Forgot password?
            </a>
          </div>
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-theme-accent-primary text-primary-foreground hover:bg-theme-accent-primary/70 transition-all duration-200 h-11"
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        {/* Toggle Login/Signup */}
        <div className="mt-6 text-center">
          <p className="text-sm text-theme-text-secondary transition-colors duration-200">
            Don&apos;t have an account?
            <Link
              href="/auth/register"
              className="text-theme-accent-secondary ml-2 hover:underline font-medium transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
