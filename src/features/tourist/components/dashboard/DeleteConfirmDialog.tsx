import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/common/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export function DeleteConfirmDialog({ 
    open, 
    onOpenChange, 
    onConfirm, 
    isDeleting = false,
    reviewTitle = "" 
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex gap-3 items-start">
                        <div className="rounded-lg bg-destructive/10 p-2 mt-0.5">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {reviewTitle ? (
                                    <>
                                        Are you sure you want to delete your review <strong>"{reviewTitle}"</strong>? 
                                        This action cannot be undone and will permanently remove the review 
                                        and all associated images.
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to delete this review? 
                                        This action cannot be undone and will permanently remove the review 
                                        and all associated images.
                                    </>
                                )}
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
