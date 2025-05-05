import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

type DeleteAllDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DeleteAllDialog({ isOpen, onClose }: DeleteAllDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await apiRequest("DELETE", "/api/flashcards");
      const data = await response.json();
      
      // Invalidate flashcards query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
      
      toast({
        title: "Success",
        description: data.message || "All flashcards have been deleted successfully.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error deleting all flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to delete all flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all your flashcards from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAll}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
