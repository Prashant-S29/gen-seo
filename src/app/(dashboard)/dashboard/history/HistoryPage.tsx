"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Loader2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Loader,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { Container } from "~/components/common";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";

type Session = {
  id: string;
  productName: string;
  category: string;
  brands: string[];
  primaryBrand: string;
  status: string;
  completedPrompts: number;
  totalPrompts: number;
  createdAt: Date;
};

export const HistoryPage: React.FC = () => {
  const router = useRouter();
  const utils = api.useUtils();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const { data, isLoading } = api.analysis.listSessions.useQuery({
    page: currentPage,
    limit: pageSize,
  });

  const deleteSession = api.analysis.deleteSession.useMutation({
    onSuccess: () => {
      void utils.analysis.listSessions.invalidate();
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    },
  });

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteSession.mutate({ sessionId: sessionToDelete });
    }
  };

  const handleView = (sessionId: string) => {
    router.push(`/dashboard/results/${sessionId}`);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const sessions = data?.sessions ?? [];
  const totalPages = data?.totalPages ?? 1;

  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.productName}</div>
          {/*<div className="text-muted-foreground text-xs">
            {format(new Date(row.original.createdAt), "MMM d, yyyy")}
          </div>*/}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span>{row.original.category}</span>,
    },
    {
      accessorKey: "prompts",
      header: "Prompts",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.completedPrompts} / {row.original.totalPrompts}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div>
          {row.original.status === "completed" ? (
            <Badge variant="success">Completed</Badge>
          ) : row.original.status === "failed" ? (
            <Badge variant="destructive">Failed</Badge>
          ) : (
            <Badge variant="secondary">
              <Loader className="animate-spin" />
              Processing
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "competitors",
      header: "Competitors",
      cell: ({ row }) => {
        const competitors = row.original.brands.filter(
          (brand) => brand !== row.original.primaryBrand,
        );
        return (
          <div className="flex flex-wrap gap-1">
            {competitors.slice(0, 3).map((brand) => (
              <span
                key={brand}
                className="bg-muted rounded-full px-2 py-0.5 text-xs"
              >
                {brand}
              </span>
            ))}
            {competitors.length > 3 && (
              <span className="text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                +{competitors.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.status === "completed" && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => handleView(row.original.id)}
            >
              <ArrowUpRight />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handleDeleteClick(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const LoadingSkeleton = () => (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Prompts</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Competitors</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="space-y-2">
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[120px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[80px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Skeleton className="h-5 w-[60px] rounded-full" />
                <Skeleton className="h-5 w-[60px] rounded-full" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton className="h-4 w-[90px]" />
                <Skeleton className="h-4 w-[40px]" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Container>
      <div className="flex min-h-screen w-full flex-col py-15">
        <section className="flex justify-between border-b p-8">
          <section>
            <h1 className="font-clashDisplay mt-5 text-5xl leading-tight font-medium">
              History
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Track all your past analyses and manage them easily.
            </p>
          </section>
          <section className="flex items-center gap-3">
            <Button size="lg" asChild className="h-9">
              <Link href="/dashboard/search">+ New Analysis</Link>
            </Button>
            <Button size="lg" asChild variant="secondary">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </section>
        </section>

        {/* Table Content */}
        <div className="p-8">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <Table className="border">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No analysis sessions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between border-t px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Rows per page:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this
              analysis session and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteSession.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteSession.isPending}
            >
              {deleteSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
};
