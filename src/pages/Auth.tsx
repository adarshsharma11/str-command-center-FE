import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// -------------------------------------------------------------
// CONSTANTS
// -------------------------------------------------------------

const AUTH_MODES = {
  LOGIN: "login",
  SIGNUP: "signup",
} as const;

type AuthMode = (typeof AUTH_MODES)[keyof typeof AUTH_MODES];

// -------------------------------------------------------------
// YUP SCHEMAS FOR EACH MODE
// -------------------------------------------------------------

const loginSchema = yup.object({
  first_name: yup.string().optional(),
  last_name: yup.string().optional(),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

const signupSchema = yup.object({
  first_name: yup.string().min(2, "First name must be at least 2 characters").required("First name is required"),
  last_name: yup.string().min(2, "Last name must be at least 2 characters").required("Last name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

// Final type extracted from base schema
type AuthValues = yup.InferType<typeof signupSchema>;

// -------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, registerAccount } = useAuth();

  const [mode, setMode] = useState<AuthMode>(AUTH_MODES.LOGIN);

  // Memoized resolver context
  const resolver = useMemo(
    () =>
      mode === AUTH_MODES.SIGNUP ? yupResolver(signupSchema) : yupResolver(loginSchema),
    [mode]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthValues>({
    resolver,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Reset form when switching tabs (clean UX)
  useEffect(() => {
    reset({ email: "", password: "", first_name: "", last_name: "" });
  }, [mode, reset]);

  // -------------------------------------------------------------
  // SUBMIT HANDLERS
  // -------------------------------------------------------------

  const onSubmit = useCallback(
    async (data: AuthValues) => {
      try {
        if (mode === AUTH_MODES.LOGIN) {
          await login({ email: data.email, password: data.password });
          toast({ title: "Welcome back!", description: "Successfully logged in." });
        } else {
          await registerAccount({ email: data.email, password: data.password, first_name: data.first_name as string, last_name: data.last_name as string });
          toast({ title: "Account created!", description: "Welcome to STR Command Center." });
        }
        navigate("/dashboard");
      } catch (err: unknown) {
        const description = err instanceof Error ? err.message : "Please check your credentials.";
        toast({ title: "Authentication failed", description });
      }
    },
    [mode, login, registerAccount, navigate, toast]
  );

  // -------------------------------------------------------------
  // UI
  // -------------------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              STR Command Center
            </CardTitle>
            <CardDescription>
              Centralized control for your short-term rentals
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue={AUTH_MODES.LOGIN}
            className="w-full"
            onValueChange={(v) => setMode(v as AuthMode)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={AUTH_MODES.LOGIN}>Login</TabsTrigger>
              <TabsTrigger value={AUTH_MODES.SIGNUP}>Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value={AUTH_MODES.LOGIN}>
              <AuthForm
                mode={mode}
                register={register}
                errors={errors}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit(onSubmit)}
              />
            </TabsContent>

            <TabsContent value={AUTH_MODES.SIGNUP}>
              <AuthForm
                mode={mode}
                register={register}
                errors={errors}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit(onSubmit)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// -------------------------------------------------------------
// REUSABLE FORM COMPONENT
// -------------------------------------------------------------

type AuthFormProps = {
  mode: AuthMode;
  register: ReturnType<typeof useForm>["register"];
  errors: FieldErrors<AuthValues>;
  isSubmitting: boolean;
  onSubmit: () => void;
};

function AuthForm({
  mode,
  register,
  errors,
  isSubmitting,
  onSubmit,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === AUTH_MODES.SIGNUP && (
        <>
          <div className="space-y-2">
            <Label>First name</Label>
            <Input placeholder="Jane" type="text" {...register("first_name")} />
            {errors.first_name && (
              <p className="text-sm text-destructive">{errors.first_name.message as string}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Last name</Label>
            <Input placeholder="Doe" type="text" {...register("last_name")} />
            {errors.last_name && (
              <p className="text-sm text-destructive">{errors.last_name.message as string}</p>
            )}
          </div>
        </>
      )}
      {/* EMAIL */}
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <Button disabled={isSubmitting} className="w-full" type="submit">
        {isSubmitting
          ? mode === AUTH_MODES.LOGIN
            ? "Logging in..."
            : "Creating account..."
          : mode === AUTH_MODES.LOGIN
          ? "Login"
          : "Sign Up"}
      </Button>
    </form>
  );
}
