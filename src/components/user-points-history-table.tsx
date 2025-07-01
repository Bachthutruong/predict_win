import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PointTransaction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type UserPointsHistoryTableProps = {
  transactions: PointTransaction[];
};

const reasonToVariant: Record<PointTransaction['reason'], "default" | "secondary" | "destructive" | "outline"> = {
    'admin-grant': 'default',
    'check-in': 'secondary',
    'feedback': 'default',
    'prediction-win': 'default',
    'referral': 'secondary'
}

export function UserPointsHistoryTable({ transactions }: UserPointsHistoryTableProps) {
  return (
    <div className="rounded-md border">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead className="w-[150px]">Reason</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[150px] text-right">Date</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {transactions.map((item) => (
            <TableRow key={item.id}>
                <TableCell>
                    <Badge variant={reasonToVariant[item.reason] || 'secondary'} className="capitalize">
                        {item.reason.replace('-', ' ')}
                    </Badge>
                </TableCell>
                <TableCell>{item.notes || 'N/A'}</TableCell>
                <TableCell className="text-right">
                    <div className={cn("flex items-center justify-end font-semibold", item.amount > 0 ? "text-green-600" : "text-destructive")}>
                        {item.amount > 0 ? <ArrowUpRight className="h-4 w-4 mr-1"/> : <ArrowDownLeft className="h-4 w-4 mr-1"/>}
                        {item.amount.toLocaleString()}
                    </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
