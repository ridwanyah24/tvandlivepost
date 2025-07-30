"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGenericMutationMutation } from "@/slice/requestSlice";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
    old_password: z.string().min(1, "Old password is required"),
    new_password: z.string().min(1, "New password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Page() {
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            old_password: "",
            new_password: "",
        },
    });

    const router = useRouter();

    const [changePasswd, { isLoading }] = useGenericMutationMutation();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await changePasswd({
                url: "/auth/change-password",
                method: "POST",
                body: data,
            }).unwrap();

            toast.success("Password changed successfully");
            router.push("/admin");
        } catch (err: any) {
            toast.error("There was an error, try again");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background px-4">
            <div className="w-full max-w-md bg-white dark:bg-card rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-6 text-center">
                    Blaccthedi Admin - Change Password
                </h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="old_password"
                            render={({ field }) => (
                                <FormItem className="relative mb-4">
                                    <FormLabel>Old Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showOldPassword ? "text" : "password"}
                                                placeholder="Enter old password"
                                                {...field}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPassword((prev) => !prev)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                tabIndex={-1}
                                            >
                                                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="new_password"
                            render={({ field }) => (
                                <FormItem className="relative mb-6">
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                {...field}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword((prev) => !prev)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                tabIndex={-1}
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full cursor-pointer hover:bg-accent"
                            disabled={isLoading}
                        >
                            {isLoading ? "Changing Password..." : "Change Password"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
