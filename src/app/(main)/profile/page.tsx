import { UserPointsHistoryTable } from "@/components/user-points-history-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPointTransactions, users } from "@/lib/data";
import { Coins, Mail, User as UserIcon } from "lucide-react";


export default function ProfilePage() {
    const user = users[1]; // Mock current user
    const userTransactions = mockPointTransactions.filter(t => t.userId === user.id);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                <p className="text-muted-foreground">View your account details and points history.</p>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{user.name}</CardTitle>
                        <CardDescription>{user.role}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-md bg-muted p-3">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <span>{user.name}</span>
                    </div>
                     <div className="flex items-center gap-3 rounded-md bg-muted p-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-md bg-muted p-3">
                        <Coins className="h-5 w-5 text-muted-foreground" />
                        <span className="font-bold">{user.points.toLocaleString()} Points</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Points History</CardTitle>
                    <CardDescription>A log of all your point transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserPointsHistoryTable transactions={userTransactions} />
                </CardContent>
            </Card>
        </div>
    )
}
