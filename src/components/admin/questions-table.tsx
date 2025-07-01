import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Question } from "@/types";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Star, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type QuestionsTableProps = {
  questions: Question[];
};

export function QuestionsTable({ questions }: QuestionsTableProps) {
  return (
    <TooltipProvider>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Stats (Displayed/Correct)</TableHead>
            <TableHead className="w-[50px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium max-w-md truncate">{item.questionText}</TableCell>
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
              <TableCell>
                {item.isPriority && (
                    <Tooltip>
                        <TooltipTrigger>
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Priority Question</p>
                        </TooltipContent>
                    </Tooltip>
                )}
              </TableCell>
              <TableCell>
                  {item.displayCount.toLocaleString()} / <span className="text-green-600">{item.correctAnswerCount.toLocaleString()}</span>
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
                    <DropdownMenuItem>
                      {item.status === 'active' ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                      {item.status === 'active' ? 'Deactivate' : 'Activate'}
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
    </TooltipProvider>
  );
}
