import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MoveUp, MoveDown, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_id: string;
  position: number;
  is_active: boolean;
  videos: {
    id: string;
    title: string;
  };
}

interface Video {
  id: string;
  title: string;
}

const fetchFeaturedContent = async () => {
  const { data, error } = await supabase
    .from('featured_content')
    .select(`
      *,
      videos:video_id (id, title)
    `)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
};

const fetchVideos = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('id, title')
    .order('title');

  if (error) throw error;
  return data || [];
};

interface FeaturedFormData {
  title: string;
  description: string;
  image_url: string;
  video_id: string;
  is_active: boolean;
}

const FeaturedForm = ({ 
  item, 
  onClose, 
  videos 
}: { 
  item?: FeaturedItem; 
  onClose: () => void;
  videos: Video[];
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FeaturedFormData>({
    title: item?.title || '',
    description: item?.description || '',
    image_url: item?.image_url || '',
    video_id: item?.video_id || '',
    is_active: item?.is_active ?? true,
  });

  const mutation = useMutation({
    mutationFn: async (data: FeaturedFormData) => {
      if (item) {
        const { error } = await supabase
          .from('featured_content')
          .update(data)
          .eq('id', item.id);
        if (error) throw error;
      } else {
        // Get next position
        const { data: maxData } = await supabase
          .from('featured_content')
          .select('position')
          .order('position', { ascending: false })
          .limit(1);
        
        const nextPosition = (maxData?.[0]?.position || 0) + 1;
        
        const { error } = await supabase
          .from('featured_content')
          .insert({ ...data, position: nextPosition });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-content'] });
      toast.success(item ? 'Featured content updated' : 'Featured content created');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video">Video</Label>
        <Select
          value={formData.video_id}
          onValueChange={(value) => setFormData({ ...formData, video_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a video" />
          </SelectTrigger>
          <SelectContent>
            {videos.map((video) => (
              <SelectItem key={video.id} value={video.id}>
                {video.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Hero Image</Label>
        <ImageUploader
          bucket="site-assets"
          onUploaded={(url) => setFormData({ ...formData, image_url: url })}
          label="Upload Hero Image"
        />
        {formData.image_url && (
          <img 
            src={formData.image_url} 
            alt="Current hero image" 
            className="w-full max-w-xs rounded-lg"
          />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : item ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default function FeaturedContent() {
  const [editingItem, setEditingItem] = useState<FeaturedItem | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: featuredItems = [], isLoading } = useQuery({
    queryKey: ['featured-content'],
    queryFn: fetchFeaturedContent,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['videos-list'],
    queryFn: fetchVideos,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('featured_content')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-content'] });
      toast.success('Featured content deleted');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, newPosition }: { id: string; newPosition: number }) => {
      const { error } = await supabase
        .from('featured_content')
        .update({ position: newPosition })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-content'] });
    },
  });

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const items = [...featuredItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;
    
    const item = items[index];
    const targetItem = items[newIndex];
    
    moveMutation.mutate({ id: item.id, newPosition: targetItem.position });
    moveMutation.mutate({ id: targetItem.id, newPosition: item.position });
  };

  const handleEdit = (item: FeaturedItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Featured Content</h1>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Featured Content</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Featured Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Featured Content' : 'Add Featured Content'}
              </DialogTitle>
            </DialogHeader>
            <FeaturedForm 
              item={editingItem} 
              onClose={handleCloseDialog}
              videos={videos}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {featuredItems.map((item, index) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span>{item.title}</span>
                  {!item.is_active && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                  )}
                  {item.image_url && <Image className="h-4 w-4 text-green-600" />}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0 || moveMutation.isPending}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === featuredItems.length - 1 || moveMutation.isPending}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Video: {item.videos?.title}
                </p>
                <p className="text-sm">
                  {item.description || 'No description'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Position: {item.position}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {featuredItems.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No featured content yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}