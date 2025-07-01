import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Feedback } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { FeedbackActions } from "./feedback-actions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type FeedbackTableProps = {
  feedbackItems: Feedback[];
};

export function FeedbackTable({ feedbackItems }: FeedbackTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">User</TableHead>
          <TableHead>Feedback</TableHead>
          <TableHead className="w-[150px]">Submitted</TableHead>
          <TableHead className="w-[120px]">Status</TableHead>
          <TableHead className="text-right w-[150px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedbackItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.user.avatarUrl} />
                  <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{item.user.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <p className="max-w-md truncate">{item.feedbackText}</p>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <Badge 
                variant={
                  item.status === 'approved' ? 'default' : 
                  item.status === 'rejected' ? 'destructive' : 'secondary'
                }
                className={item.status === 'approved' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : ''}
              >
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <FeedbackActions item={item} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
