'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  userId: z.string().min(1, "Please select a user."),
  amount: z.coerce.number().int("Points must be a whole number."),
  notes: z.string().optional(),
});

type GrantPointsFormProps = {
  users: User[];
};

export function GrantPointsForm({ users }: GrantPointsFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      amount: 100,
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedUser = users.find(u => u.id === values.userId);
    console.log(values);
    toast({
      title: "Points Granted!",
      description: `${values.amount} points have been granted to ${selectedUser?.name}.`,
    });
    form.reset();
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>User</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user to grant points" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name} ({user.email})</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    The user who will receive or lose points.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="100" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Enter a positive number to add points, or a negative number to subtract.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <div className="md:col-span-2">
                            <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Welcome bonus, refund for prediction..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                    </div>
                    <Button type="submit">Grant Points</Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
