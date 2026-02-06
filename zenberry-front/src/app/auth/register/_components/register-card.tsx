"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, User, Phone } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { registerSchema, type RegisterFormData } from "@/src/schemas/auth/register-schema";
import { useAuthContext } from "@/src/contexts/auth-context";
import { toast } from "sonner";
import {
  formatPhone,
  shouldShowPhoneError,
  processPhoneInputChange,
  processPhoneFocus,
  processPhoneBlur,
} from "@/src/lib/phone";

export function RegisterCard() {
  const router = useRouter();
  const { registerWithCredentials } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [phoneInputValue, setPhoneInputValue] = useState("");
  const [phoneDisplayValue, setPhoneDisplayValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    control,
    watch,
    trigger,
    setValue,
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptsMarketing: false,
    },
  });

  const phoneValue = watch("phone");
  const currentPhoneValue = phoneInputValue || phoneValue;
  const showPhoneError = shouldShowPhoneError(currentPhoneValue);

  const updatePhoneState = (
    unformattedValue: string,
    shouldTriggerValidation = true
  ) => {
    setValue("phone", unformattedValue, { shouldValidate: shouldTriggerValidation });
    setPhoneInputValue(unformattedValue);
    setPhoneDisplayValue(formatPhone(unformattedValue));
  };

  const handlePhoneChange = async (inputValue: string) => {
    const { unformatted, shouldClear } = processPhoneInputChange(inputValue);
    
    if (shouldClear) {
      updatePhoneState("", true);
    } else {
      updatePhoneState(unformatted, true);
    }
    
    await trigger("phone");
  };

  const handlePhoneFocus = (currentValue: string) => {
    const normalized = processPhoneFocus(currentValue);
    if (normalized !== null) {
      updatePhoneState(normalized, true);
    }
  };

  const handlePhoneBlur = async () => {
    const currentUnformatted = phoneInputValue || phoneValue;
    const { shouldClear, displayValue } = processPhoneBlur(currentUnformatted);

    if (shouldClear) {
      setPhoneInputValue("");
      setPhoneDisplayValue("");
      setValue("phone", "", { shouldValidate: false });
      clearErrors("phone");
      await trigger("phone");
    } else {
      setPhoneDisplayValue(displayValue);
    }
  };

  const onSubmit = (data: RegisterFormData) => {
    startTransition(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...registerData } = data;
        const payload = {
          ...registerData,
          phone: registerData.phone && registerData.phone.trim() !== "" 
            ? registerData.phone 
            : undefined,
        };
        await registerWithCredentials(payload);
        toast.success("Account created successfully!");
        router.push("/auth/success");
        router.refresh();
      } catch (error) {
        console.error("Registration error:", error);
        toast.error(
          error instanceof Error ? error.message : "Registration failed"
        );
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
          Join ZenBerry Naturals today
        </p>
      </div>
      {/* Auth Form Card */}
      <div className="bg-theme-bg-secondary rounded-2xl p-8 shadow-lg transition-colors duration-200 border border-theme-text-secondary/10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-theme-text-primary transition-colors duration-200"
              >
                First Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-secondary" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  className={`pl-10 bg-theme-bg-primary border-theme-text-secondary/20 text-theme-text-primary placeholder:text-theme-text-secondary/50 focus:border-theme-accent-secondary transition-colors duration-200 ${
                    errors.firstName ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-theme-text-primary transition-colors duration-200"
              >
                Last Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-secondary" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  className={`pl-10 bg-theme-bg-primary border-theme-text-secondary/20 text-theme-text-primary placeholder:text-theme-text-secondary/50 focus:border-theme-accent-secondary transition-colors duration-200 ${
                    errors.lastName ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

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

          {/* Phone Field */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-theme-text-primary transition-colors duration-200"
            >
              Phone (Optional)
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-secondary" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneDisplayValue}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onFocus={(e) => handlePhoneFocus(e.target.value)}
                onBlur={handlePhoneBlur}
                className={`pl-10 bg-theme-bg-primary text-theme-text-primary placeholder:text-theme-text-secondary/50 transition-colors duration-200 ${
                  errors.phone || showPhoneError
                    ? "border-red-500! focus:border-red-500! focus-visible:ring-red-500!"
                    : "border-theme-text-secondary/20 focus:border-theme-accent-secondary"
                }`}
              />
            </div>
            {(errors.phone || showPhoneError) && (
              <p className="text-sm text-red-500">
                {errors.phone?.message || "Phone must be in format +1 (XXX) XXX-XXXX (e.g., +1 (555) 123-4567)"}
              </p>
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
                placeholder="Create a password"
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

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-theme-text-primary transition-colors duration-200"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-secondary" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className={`pl-10 pr-10 bg-theme-bg-primary border-theme-text-secondary/20 text-theme-text-primary placeholder:text-theme-text-secondary/50 focus:border-theme-accent-secondary transition-colors duration-200 ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-secondary hover:text-theme-accent-secondary transition-colors duration-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Marketing Checkbox */}
          <div className="flex items-center space-x-2">
            <Controller
              name="acceptsMarketing"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="acceptsMarketing"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              )}
            />
            <Label
              htmlFor="acceptsMarketing"
              className="text-sm text-theme-text-primary cursor-pointer"
            >
              I want to receive marketing emails and special offers
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending || !isValid || Object.keys(errors).length > 0}
            className="w-full cursor-pointer bg-theme-accent-primary text-primary-foreground hover:bg-theme-accent-primary/70 transition-all duration-200 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
        {/* Toggle Login/Signup */}
        <div className="mt-6 text-center">
          <p className="text-sm text-theme-text-secondary transition-colors duration-200">
            Already have an account?
            <Link
              href="/auth"
              className="text-theme-accent-secondary ml-2 hover:underline font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
