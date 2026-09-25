"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { authApi } from "@/lib/api/auth";
import { ApiError, setAccessToken } from "@/lib/api/client";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginForm registered={false} />}>
      <LoginFormWithSearchParams />
    </Suspense>
  );
}

function LoginFormWithSearchParams() {
  const searchParams = useSearchParams();
  return <LoginForm registered={searchParams.get("registered") === "true"} />;
}

type LoginFormProps = {
  registered: boolean;
};

function LoginForm({ registered }: LoginFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    try {
      const response = await authApi.login(values);

      if ("requiresTwoFactor" in response.data) {
        sessionStorage.setItem("tempToken", response.data.tempToken);
        router.push("/2fa");
        return;
      }

      setAccessToken(response.data.accessToken);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        setFormError("Invalid credentials");
        return;
      }

      setFormError("We could not log you in. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Welcome back
        </h1>
        <p className="text-sm text-muted">
          Access your personal finance dashboard.
        </p>
      </div>

      {registered ? (
        <p
          className="rounded-panel bg-accent px-4 py-3 text-sm font-semibold text-success"
          role="status"
        >
          Registered successfully. Please log in.
        </p>
      ) : null}

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
            autoComplete="current-password"
            placeholder="••••••••"
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 px-4 text-sm font-semibold"
        >
          {isSubmitting ? <Spinner /> : null}
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link className="font-semibold text-primary transition-colors hover:text-primary-hover" href="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
