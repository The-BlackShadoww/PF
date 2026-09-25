"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);

    try {
      await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      router.push("/login?registered=true");
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        setFormError("An account with this email already exists.");
        return;
      }

      setFormError("We could not create your account. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Create account
        </h1>
        <p className="text-sm text-muted">
          Start tracking your finances with a secure account.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? (
          <p
            className="rounded-panel bg-danger-surface px-4 py-3 text-sm font-semibold text-white"
            role="alert"
          >
            {formError}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
            htmlFor="name"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-xs font-medium text-danger" id="name-error" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs font-medium text-danger" id="email-error" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            {...register("password")}
          />
          {errors.password ? (
            <p
              className="text-xs font-medium text-danger"
              id="password-error"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-error" : undefined
            }
            className="w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p
              className="text-xs font-medium text-danger"
              id="confirm-password-error"
              role="alert"
            >
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 px-4 text-sm font-semibold"
        >
          {isSubmitting ? <Spinner /> : null}
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-primary transition-colors hover:text-primary-hover" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
