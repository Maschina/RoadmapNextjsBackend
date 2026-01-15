"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface PendingUser {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  banned: boolean;
  banReason: string | null;
}

export default function UsersPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    try {
      // Use better-auth admin API to list users
      const response = await authClient.admin.listUsers({
        query: {
          filterField: "banReason",
          filterValue: "pending_approval",
          filterOperator: "eq",
        },
      });

      if (response.data) {
        setPendingUsers(response.data.users as PendingUser[]);
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
      toast.error("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      // Unban the user to approve them
      await authClient.admin.unbanUser({
        userId,
      });

      toast.success("User approved successfully");
      fetchPendingUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Are you sure you want to reject this user? They will remain banned.")) {
      return;
    }

    setProcessingId(userId);
    try {
      // Update ban reason to "rejected" instead of "pending_approval"
      await authClient.admin.banUser({
        userId,
        banReason: "rejected",
      });

      toast.success("User rejected");
      fetchPendingUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <DashboardHeader
        title="User Approvals"
        description="Review and approve new user registrations"
      />
      <div className="flex-1 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Pending Approvals</h2>
          <p className="text-sm text-muted-foreground">
            New users require admin approval before they can access the dashboard
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Loading pending users...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No pending user approvals
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.name || "-"}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(user.id)}
                            disabled={processingId === user.id}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(user.id)}
                            disabled={processingId === user.id}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
