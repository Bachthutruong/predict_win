import { GrantPointsForm } from "@/components/admin/grant-points-form";
import { PointTransactionsTable } from "@/components/admin/point-transactions-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPointTransactions, users } from "@/lib/data";

export default function GrantPointsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Grant Points</h1>
                <p className="text-muted-foreground">Manually add or remove points from a user's account.</p>
            </div>
            
            <GrantPointsForm users={users} />

            <Card>
                 <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A log of all recent manual point adjustments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PointTransactionsTable transactions={mockPointTransactions} />
                </CardContent>
            </Card>
        </div>
    )
}
