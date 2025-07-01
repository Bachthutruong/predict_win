import { getUserProfileData } from "@/app/actions";
import { UserPointsHistoryTable } from "@/components/user-points-history-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Mail, User as UserIcon } from "lucide-react";


export default async function ProfilePage() {
    const { user, transactions } = await getUserProfileData();

    if (!user) {
        return <div>User not found.</div>
    }

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
                    <UserPointsHistoryTable transactions={transactions} />
                </CardContent>
            </Card>
        </div>
    )
}
