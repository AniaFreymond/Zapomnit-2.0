import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { KaTeXComponent } from "@/lib/katex";
import { Tag } from "@shared/schema";

// Schema for form validation
const formSchema = z.object({
  front: z.string().min(1, "Front side cannot be empty"),
  back: z.string().min(1, "Back side cannot be empty"),
  tagIds: z.array(z.number())
});

type CardFormValues = z.infer<typeof formSchema>;

type CardFormProps = {
  isOpen: boolean;
  onClose: () => void;
  editCard?: {
    id: number;
    front: string;
    back: string;
    tags: Tag[];
  };
};

export default function CardForm({ isOpen, onClose, editCard }: CardFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState<"front" | "back" | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with default values or values from editCard
  const form = useForm<CardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      front: editCard?.front || "",
      back: editCard?.back || "",
      tagIds: editCard?.tags.map(tag => tag.id) || []
    }
  });

  // Load tags when component mounts
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast({
          title: "Error",
          description: "Failed to load tags. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [toast]);

  // Update form values when editCard changes
  useEffect(() => {
    if (editCard) {
      form.reset({
        front: editCard.front,
        back: editCard.back,
        tagIds: editCard.tags.map(tag => tag.id)
      });
    } else {
      form.reset({
        front: "",
        back: "",
        tagIds: []
      });
    }
  }, [editCard, form]);

  // Form submission handler
  const onSubmit = async (values: CardFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (editCard) {
        // Update existing flashcard
        await apiRequest("PUT", `/api/flashcards/${editCard.id}`, values);
        toast({
          title: "Success",
          description: "Flashcard updated successfully.",
        });
      } else {
        // Create new flashcard
        await apiRequest("POST", "/api/flashcards", values);
        toast({
          title: "Success",
          description: "Flashcard created successfully.",
        });
      }

      // Invalidate flashcards query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
      
      // Close the dialog and reset form
      handleClose();
    } catch (error) {
      console.error("Error saving flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to save the flashcard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setPreviewMode(null);
    onClose();
  };

  // Toggle preview mode
  const togglePreview = (side: "front" | "back") => {
    if (previewMode === side) {
      setPreviewMode(null);
    } else {
      setPreviewMode(side);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editCard ? "Edit Flashcard" : "Create New Flashcard"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Front Side */}
            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Front Side</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => togglePreview("front")}
                    >
                      {previewMode === "front" ? "Edit" : "Preview"}
                    </Button>
                  </div>
                  {previewMode === "front" ? (
                    <div className="min-h-[150px] p-3 border rounded-md overflow-y-auto">
                      <KaTeXComponent mathExpression={field.value} />
                    </div>
                  ) : (
                    <FormControl>
                      <Textarea
                        placeholder="Enter the front side content (supports LaTeX with $ symbols)"
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Back Side */}
            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Back Side</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => togglePreview("back")}
                    >
                      {previewMode === "back" ? "Edit" : "Preview"}
                    </Button>
                  </div>
                  {previewMode === "back" ? (
                    <div className="min-h-[150px] p-3 border rounded-md overflow-y-auto">
                      <KaTeXComponent mathExpression={field.value} />
                    </div>
                  ) : (
                    <FormControl>
                      <Textarea
                        placeholder="Enter the back side content (supports LaTeX with $ symbols)"
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tagIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading tags...</p>
                    ) : (
                      tags.map((tag) => (
                        <div key={tag.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`tag-${tag.id}`}
                            checked={field.value.includes(tag.id)}
                            onChange={(e) => {
                              const tagId = tag.id;
                              if (e.target.checked) {
                                field.onChange([...field.value, tagId]);
                              } else {
                                field.onChange(field.value.filter(id => id !== tagId));
                              }
                            }}
                            className="mr-1"
                          />
                          <label 
                            htmlFor={`tag-${tag.id}`}
                            className="flex items-center text-sm cursor-pointer"
                          >
                            <span 
                              className="w-3 h-3 rounded-full mr-1"
                              style={{ backgroundColor: tag.color }}
                            ></span>
                            {tag.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="text-xs text-muted-foreground">
              <p>LaTeX Tips:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Use single $ for inline math: $E=mc^2$</li>
                <li>Use double $$ for display math: $$\int_0^1 x^2 dx$$</li>
              </ul>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editCard ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
