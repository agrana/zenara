'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { usePromptStore, type CreatePromptData } from '../store/promptStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Loader2, Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    prompts,
    templateTypes,
    isLoading,
    error,
    fetchPrompts,
    fetchTemplateTypes,
    createPrompt,
    updatePrompt,
    deletePrompt,
    setError,
  } = usePromptStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    templateType: 'default',
    promptText: '',
  });

  useEffect(() => {
    if (user) {
      fetchPrompts(user.id);
      fetchTemplateTypes();
    }
  }, [user, fetchPrompts, fetchTemplateTypes]);

  const handleOpenDialog = (prompt?: any) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        name: prompt.name,
        templateType: prompt.templateType,
        promptText: prompt.promptText,
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        name: '',
        templateType: 'default',
        promptText: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPrompt(null);
    setFormData({
      name: '',
      templateType: 'default',
      promptText: '',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, {
          name: formData.name,
          promptText: formData.promptText,
        });
      } else {
        await createPrompt({
          ...formData,
        } as CreatePromptData);
      }
      handleCloseDialog();
      if (user) {
        fetchPrompts(user.id);
      }
    } catch (err) {
      console.error('Error saving prompt:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;

    try {
      await deletePrompt(id);
      if (user) {
        fetchPrompts(user.id);
      }
    } catch (err) {
      console.error('Error deleting prompt:', err);
    }
  };

  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>Please log in to access your profile.</p>
      </div>
    );
  }

  const userPrompts = prompts.filter(p => !p.isDefault);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.push('/')}
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
                Profile
              </h1>
              <p className='text-slate-600 dark:text-slate-400'>
                Manage your custom AI prompts
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className='h-4 w-4 mr-2' />
            New Prompt
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className='mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg'>
            {error}
          </div>
        )}

        {/* Prompts List */}
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : userPrompts.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <p className='text-slate-600 dark:text-slate-400 mb-4'>
                You haven't created any custom prompts yet.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className='h-4 w-4 mr-2' />
                Create Your First Prompt
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {userPrompts.map(prompt => (
              <Card
                key={prompt.id}
                className='hover:shadow-lg transition-shadow'
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg text-slate-900 dark:text-white'>
                        {prompt.name}
                      </h3>
                      <p className='text-sm text-slate-600 dark:text-slate-400 mt-1'>
                        {templateTypes[prompt.templateType]?.name ||
                          prompt.templateType}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleOpenDialog(prompt)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDelete(prompt.id)}
                      >
                        <Trash2 className='h-4 w-4 text-red-600' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-slate-600 dark:text-slate-400 line-clamp-3'>
                    {prompt.promptText}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>
                {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Name</label>
                <Input
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='My Custom Prompt'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>
                  Template Type
                </label>
                <Select
                  value={formData.templateType}
                  onValueChange={value =>
                    setFormData({ ...formData, templateType: value })
                  }
                  disabled={!!editingPrompt}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(templateTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingPrompt && (
                  <p className='text-sm text-slate-500 mt-1'>
                    Template type cannot be changed after creation
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>
                  Prompt Text
                </label>
                <Textarea
                  value={formData.promptText}
                  onChange={e =>
                    setFormData({ ...formData, promptText: e.target.value })
                  }
                  placeholder='You are a helpful assistant. Please...'
                  rows={10}
                  required
                  className='font-mono text-sm'
                />
                <p className='text-sm text-slate-500 mt-1'>
                  Use {'{content}'} as a placeholder for the note content
                </p>
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  )}
                  {editingPrompt ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
