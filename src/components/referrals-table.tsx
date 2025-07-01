import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Referral } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type ReferralsTableProps = {
  referrals: Referral[];
};

export function ReferralsTable({ referrals }: ReferralsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Sign-up Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrals.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="font-medium">{item.referredUser.name}</div>
            </TableCell>
            <TableCell>
              {format(new Date(item.referredUser.createdAt), "PPP")}
            </TableCell>
            <TableCell>
              <Badge 
                variant={
                  item.status === 'completed' ? 'default' : 'secondary'
                }
                className={item.status === 'completed' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : ''}
              >
                {item.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
