import { getReferralsData } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Gift, UserCheck, UserPlus } from "lucide-react";
import { ReferralsTable } from "@/components/referrals-table";

export default async function ReferralsPage() {
    const { referrals, currentUser } = await getReferralsData();
    
    if (!currentUser) {
        return <div>User not found. Please log in.</div>;
    }

    const referralCode = `REF-${currentUser.id}-${currentUser.name.toUpperCase().slice(0,3)}`;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Refer a Friend</h1>
                <p className="text-muted-foreground">
                    Invite your friends to PredictWin and earn points when they join and participate!
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Referral Code</CardTitle>
                    <CardDescription>Share this code with your friends. They can enter it when they sign up.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full max-w-md items-center space-x-2">
                        <Input type="text" readOnly value={referralCode} className="font-mono text-lg" />
                        <Button type="submit">
                            <Copy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrals.filter(r => r.status === 'completed').length}</div>
                        <p className="text-xs text-muted-foreground">Completed 3-day check-in</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrals.filter(r => r.status === 'pending').length}</div>
                        <p className="text-xs text-muted-foreground">Signed up, activity pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Bonus Reward</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">9 more referrals</div>
                        <p className="text-xs text-muted-foreground">For a 1000 point bonus</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Referrals</CardTitle>
                    <CardDescription>A list of users you've referred.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ReferralsTable referrals={referrals} />
                </CardContent>
            </Card>
        </div>
    );
}
