"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGenericMutationMutation } from "@/slice/requestSlice";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAppDispatch } from "@/hooks/redux-hooks";
import { logInAdmin } from "@/slice/authAdmin";

// Schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // grant_type: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Page() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      // grant_type: "password"
    },
  });

  const router = useRouter();
  const [loginAdmin, { isLoading, isSuccess, isError, error }] = useGenericMutationMutation();
  const dispatch = useAppDispatch();
  const onSubmit = async (data: LoginFormValues) => {
    console.log(data);

    try {
      const res = await loginAdmin({
        url: "/auth/login",
        method: "POST",
        body: data,
      }).unwrap();

      dispatch(
        logInAdmin({
          accessToken: res.access_token,
          refresh_token: res.refresh_token,
          user: {
            username: data?.username,
            password: data?.password // or null, or fetch later
          },
        })
      );

      toast.success("Login successful!");
      router.push("/admin");
    } catch (err: any) {
      toast.error("Invalid login credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background px-4">
      <div className="w-full max-w-md bg-white dark:bg-card rounded-xl shadow-md p-6">
        {/* <Image src="/blacctheddi.jpg" alt="" width={100} height={100} className="mx-auto"/> */}
        <h2 className="text-xl font-bold mb-6 text-center">
          Blaccthedi Admin - Change Password
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="default is admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                const [showPassword, setShowPassword] = useState(false);

                return (
                  <FormItem className="relative">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          className="pr-10" // Add padding to avoid overlap with icon
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          tabIndex={-1} // Prevent it from being focusable
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <p className="text-accent font-medium text-md underline cursor-pointer" onClick={() => router.push("/auth/changePasswd")}>Change Password</p>
            <Button type="submit" className="w-full cursor-pointer bg-accent" disabled={isLoading} >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
