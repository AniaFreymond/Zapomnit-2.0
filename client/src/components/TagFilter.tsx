import { useEffect, useState } from "react";
import { CheckIcon, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tag } from "@shared/schema";

type TagFilterProps = {
  onTagsChange: (selectedTagIds: number[]) => void;
};

export default function TagFilter({ onTagsChange }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all tags
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

  // Handle tag selection
  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prevSelectedTagIds => {
      const newSelectedTagIds = prevSelectedTagIds.includes(tagId)
        ? prevSelectedTagIds.filter(id => id !== tagId)
        : [...prevSelectedTagIds, tagId];
      
      // Notify parent component of change
      onTagsChange(newSelectedTagIds);
      
      return newSelectedTagIds;
    });
  };

  // Clear all selected tags
  const clearAllTags = () => {
    setSelectedTagIds([]);
    onTagsChange([]);
  };

  if (isLoading) {
    return <div className="h-12 flex items-center justify-center text-sm text-gray-500">Loading tags...</div>;
  }

  if (tags.length === 0) {
    return <div className="h-12 flex items-center justify-center text-sm text-gray-500">No tags available</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Filter by Tags</h3>
        {selectedTagIds.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllTags}
            className="h-8 px-2 text-xs"
          >
            Clear all
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <ScrollArea className="h-12 whitespace-nowrap pb-1 hide-scrollbar">
        <div className="flex space-x-2">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                style={{ 
                  backgroundColor: isSelected ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: isSelected ? 'white' : tag.color
                }}
                className="cursor-pointer hover:opacity-80 transition-all"
                onClick={() => toggleTag(tag.id)}
              >
                {isSelected && <CheckIcon className="mr-1 h-3 w-3" />}
                {tag.name}
              </Badge>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
