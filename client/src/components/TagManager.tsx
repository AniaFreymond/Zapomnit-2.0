import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tag } from "@shared/schema";
import { PlusIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import TagForm from "./TagForm";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function TagManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [isTagFormOpen, setIsTagFormOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
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

    if (isOpen) {
      fetchTags();
    }
  }, [isOpen, toast]);

  const handleDeleteTag = async (tagId: number) => {
    try {
      await apiRequest("DELETE", `/api/tags/${tagId}`);
      
      // Refresh the tag list
      setTags(tags.filter(tag => tag.id !== tagId));
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
      
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: "Failed to delete tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditTag(tag);
    setIsTagFormOpen(true);
  };

  const handleAddNewTag = () => {
    setEditTag(null);
    setIsTagFormOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          Manage Tags
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Create and manage tags with custom colors
            </p>
            <Button onClick={handleAddNewTag} size="sm">
              <PlusIcon className="h-4 w-4 mr-1" />
              New Tag
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading tags...</div>
          ) : tags.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No tags found.</p>
              <Button onClick={handleAddNewTag}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Create Your First Tag
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {tags.map((tag) => (
                <div 
                  key={tag.id} 
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <div className="flex items-center">
                    <Badge 
                      style={{ backgroundColor: tag.color }} 
                      className="mr-2 text-white">
                      {tag.name}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleEditTag(tag)}
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive" 
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Tag Form */}
      <TagForm
        isOpen={isTagFormOpen}
        onClose={() => {
          setIsTagFormOpen(false);
          setEditTag(null);
        }}
        editTag={editTag}
        onSuccess={() => {
          // Refresh tags
          queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
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
            }
          };
          fetchTags();
        }}
      />
    </Dialog>
  );
}
