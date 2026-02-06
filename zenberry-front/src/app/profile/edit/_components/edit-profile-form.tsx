"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Mail, User, Phone } from "lucide-react";
import { useAuthContext } from "@/src/contexts/auth-context";
import {
  formatPhone,
  shouldShowPhoneError,
  processPhoneInputChange,
  processPhoneFocus,
  processPhoneBlur,
} from "@/src/lib/phone";
import { toast } from "sonner";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+1\d{10}$/.test(val),
      "Phone must be in format +1 (XXX) XXX-XXXX (e.g., +1 (555) 123-4567)"
    ),
  acceptsMarketing: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  onCancel?: () => void;
}

export function EditProfileForm({ onCancel }: EditProfileFormProps) {
  const { customer, updateProfile } = useAuthContext();
  const [phoneInputValue, setPhoneInputValue] = useState("");
  const [phoneDisplayValue, setPhoneDisplayValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, isValid },
    control,
    watch,
    trigger,
    setValue,
    clearErrors,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    criteriaMode: "all",
    values: {
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      acceptsMarketing: customer?.acceptsMarketing || false,
    },
  });

  const phoneValue = watch("phone");
  const currentPhoneValue = phoneInputValue || phoneValue;
  const showPhoneError = shouldShowPhoneError(currentPhoneValue);

  // Inicializar o valor formatado quando o componente monta ou quando customer muda
  useEffect(() => {
    if (customer?.phone) {
      setPhoneInputValue(customer.phone);
      setPhoneDisplayValue(formatPhone(customer.phone));
    } else {
      setPhoneInputValue("");
      setPhoneDisplayValue("");
    }
    // Validar o formulário após inicializar os valores
    trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.phone]);

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

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-8">
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
                  ? "border-[0.5px] border-red-500! focus:border-[0.5px] focus:border-red-500! focus-visible:ring-red-500!"
                  : "border-theme-text-secondary/20 focus:border-theme-accent-secondary"
              }`}
            />
          </div>
          {(errors.phone || showPhoneError) && (
            <p className="text-sm text-red-500">
              {errors.phone?.message ||
                "Phone must be in format +1 (XXX) XXX-XXXX (e.g., +1 (555) 123-4567)"}
            </p>
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

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 text-primary cursor-pointer"
          >
            Change Password
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 cursor-pointer"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting || Object.keys(errors).length > 0}
            className="flex-1 cursor-pointer bg-theme-accent-primary text-primary-foreground hover:bg-theme-accent-primary/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
