import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Prediction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

type PredictionsTableProps = {
  predictions: Prediction[];
};

export function PredictionsTable({ predictions }: PredictionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {predictions.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium max-w-sm truncate">
                <Link href={`/predictions/${item.id}`} className="hover:underline">
                    {item.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    item.status === "active"
                      ? "bg-green-500/20 text-green-700 border-green-500/30"
                      : "bg-gray-500/20 text-gray-700 border-gray-500/30"
                  )}
                  variant="outline"
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{item.pointsCost} Points</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                       <Link href={`/predictions/${item.id}`}>
                         <Eye className="mr-2 h-4 w-4" /> View
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
