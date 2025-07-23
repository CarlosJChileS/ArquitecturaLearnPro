import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";

interface Column {
  key: string;
  label: string;
  type?: "text" | "badge" | "date" | "actions";
}

interface DataTableProps<T extends Record<string, unknown>> {
  title: string;
  data: T[];
  columns: Column[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({ title, data, columns, onEdit, onDelete, onView }: DataTableProps<T>) {
  const renderCell = (item: T, column: Column) => {
    const value = (item as Record<string, unknown>)[column.key];
    
    switch (column.type) {
      case "badge":
        return (
          <Badge 
            variant={value === "active" || value === "published" ? "default" : "secondary"}
            className={value === "active" || value === "published" ? "bg-success text-success-foreground" : ""}
          >
            {value}
          </Badge>
        );
      case "date":
        return new Date(value).toLocaleDateString();
      case "actions":
        return (
          <div className="flex items-center gap-2">
            {onView && (
              <Button variant="ghost" size="icon" onClick={() => onView(item)}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      default:
        return value;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {renderCell(item, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}