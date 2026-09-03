"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black leading-none text-ink">
          Log in
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
            className="block text-sm font-semibold text-muted"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="w-full rounded-panel border border-ink px-4 py-3 text-sm text-ink outline-none transition focus:ring-2 focus:ring-primary"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-danger" id="email-error" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            className="block text-sm font-semibold text-muted"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="w-full rounded-panel border border-ink px-4 py-3 text-sm text-ink outline-none transition focus:ring-2 focus:ring-primary"
            {...register("password")}
          />
          {errors.password ? (
            <p
              className="text-sm text-danger"
              id="password-error"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-card bg-primary px-4 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Spinner /> : null}
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link className="font-semibold text-ink underline" href="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
