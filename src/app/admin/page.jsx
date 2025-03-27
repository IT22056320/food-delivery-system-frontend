"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getAllUsers, deleteUser } from "@/lib/api"

export default function AdminPage() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [userToDelete, setUserToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (!user) {
            router.push("/auth/login")
            return
        }

        if (!user.isAdmin) {
            router.push("/dashboard")
            toast({
                variant: "destructive",
                title: "Access denied",
                description: "You don't have permission to access this page",
            })
            return
        }

        const fetchUsers = async () => {
            try {
                const data = await getAllUsers()
                setUsers(data)
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch users",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [user, router, toast])

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        setIsDeleting(true)
        try {
            await deleteUser(userToDelete)

            setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userToDelete))

            toast({
                title: "User deleted",
                description: "User has been deleted successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Delete failed",
                description: error instanceof Error ? error.message : "Failed to delete user",
            })
        } finally {
            setIsDeleting(false)
            setUserToDelete(null)
        }
    }

    if (!user || !user.isAdmin) {
        return null
    }

    return (
        <div className="container py-12">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users and system settings</p>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Verified</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        <span className="mt-2 block">Loading users...</span>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.isAdmin ? (
                                                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-medium">
                                                    User
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.isVerified ? (
                                                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded-full text-xs font-medium">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 px-2 py-1 rounded-full text-xs font-medium">
                                                    Not Verified
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setUserToDelete(user._id)}
                                                        disabled={user.isAdmin}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the user account and all
                                                            associated data.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting}>
                                                            {isDeleting ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Deleting...
                                                                </>
                                                            ) : (
                                                                "Delete"
                                                            )}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

