import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, InfoIcon } from "lucide-react";
import CardFlip from "@/components/CardFlip";
import CardForm from "@/components/CardForm";
import DeleteAllDialog from "@/components/DeleteAllDialog";
import SearchBar from "@/components/SearchBar";
import TagFilter from "@/components/TagFilter";
import TagManager from "@/components/TagManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardWithTags } from "@shared/schema";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editCard, setEditCard] = useState<FlashcardWithTags | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const isMobile = useMobile();
  const { toast } = useToast();

  // Fetch flashcards
  const { data: flashcards, isLoading, isError } = useQuery<FlashcardWithTags[]>({
    queryKey: ['/api/flashcards'],
  });

  // Filter flashcards based on search query and tags
  const filteredFlashcards = useQuery<FlashcardWithTags[]>({
    queryKey: ['/api/flashcards/search', searchQuery, selectedTagIds],
    enabled: !!searchQuery || selectedTagIds.length > 0,
    queryFn: async () => {
      const tagParams = selectedTagIds.length > 0 
        ? selectedTagIds.map(id => `tags=${id}`).join('&') 
        : '';
      const queryParams = `q=${encodeURIComponent(searchQuery)}${tagParams ? `&${tagParams}` : ''}`;
      const response = await fetch(`/api/flashcards/search?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to search flashcards');
      }
      return response.json();
    }
  });

  // Use the filtered results if searching, otherwise use all flashcards
  const isFiltering = !!searchQuery || selectedTagIds.length > 0;
  const isSearchFiltering = !!searchQuery;
  const isTagFiltering = selectedTagIds.length > 0;
  const displayedFlashcards = isFiltering
    ? filteredFlashcards.data || []
    : flashcards || [];
    
  // Update search status whenever search results change
  useEffect(() => {
    setIsSearchActive(isFiltering);
    
    // Show a toast notification when search returns results
    if (isFiltering && filteredFlashcards.data) {
      const count = filteredFlashcards.data.length;
      if (count > 0) {
        toast({
          title: `Found ${count} ${count === 1 ? 'card' : 'cards'}`,
          description: searchQuery 
            ? `Search results for "${searchQuery}"` 
            : 'Filtered by selected tags',
          variant: "default",
        });
      }
    }
  }, [filteredFlashcards.data, isFiltering, searchQuery, toast]);

  // Handle edit card
  const handleEditCard = (card: FlashcardWithTags) => {
    setEditCard(card);
    setIsCardFormOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Flashcards</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and organize your flashcards with LaTeX support
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            onClick={() => setIsCardFormOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {isMobile ? "New" : "New Flashcard"}
          </Button>
          
          {displayedFlashcards.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              {isMobile ? "Delete All" : "Delete All"}
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-6 space-y-4">
        <SearchBar onSearch={setSearchQuery} />
        
        <div className="flex justify-between items-center">
          <TagFilter onTagsChange={setSelectedTagIds} />
          <TagManager />
        </div>
      </div>
      
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-64">
                  <CardContent className="p-5 h-full bg-gray-100 dark:bg-gray-800"></CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">Error loading flashcards. Please try again.</p>
            </Card>
          ) : displayedFlashcards.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No flashcards found.</p>
              <Button onClick={() => setIsCardFormOpen(true)}>Create Your First Flashcard</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedFlashcards.map((card) => (
                <div 
                  key={card.id}
                  className="transition-all duration-500"
                >
                  <CardFlip
                    id={card.id}
                    front={card.front}
                    back={card.back}
                    tags={card.tags}
                    onEdit={() => handleEditCard(card)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-24">
                  <CardContent className="p-5 h-full bg-gray-100 dark:bg-gray-800"></CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">Error loading flashcards. Please try again.</p>
            </Card>
          ) : displayedFlashcards.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No flashcards found.</p>
              <Button onClick={() => setIsCardFormOpen(true)}>Create Your First Flashcard</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayedFlashcards.map((card) => (
                <div 
                  key={card.id}
                  className="transition-all duration-500"
                >
                  <CardFlip
                    id={card.id}
                    front={card.front}
                    back={card.back}
                    tags={card.tags}
                    onEdit={() => handleEditCard(card)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Form Modal */}
      <CardForm
        isOpen={isCardFormOpen}
        onClose={() => {
          setIsCardFormOpen(false);
          setEditCard(null);
        }}
        editCard={editCard as any}
      />
      
      {/* Delete All Confirmation Dialog */}
      <DeleteAllDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
