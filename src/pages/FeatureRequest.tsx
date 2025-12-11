import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Upload, X, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFeatureRequests } from '@/hooks/useFeatureRequests';
import { useAnsprache } from '@/contexts/AnspracheContext';
import { useAuth } from '@/contexts/AuthContext';

export default function FeatureRequest() {
  const navigate = useNavigate();
  const { t } = useAnsprache();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const { createFeatureRequest, isCreating } = useFeatureRequests();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createFeatureRequest({
        title,
        description,
        priority,
        image: image || undefined,
      });
      setIsSubmitted(true);
    } catch (error) {
      // Error handled in hook
    }
  };

  const backPath = isAdmin ? '/admin' : '/';

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {t('Vielen Dank!', 'Vielen Dank!')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t(
                'Deine Anfrage wurde erfolgreich gesendet. Wir prüfen sie und melden uns bei dir.',
                'Ihre Anfrage wurde erfolgreich gesendet. Wir prüfen sie und melden uns bei Ihnen.'
              )}
            </p>
            <Button onClick={() => navigate(backPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('Zurück zum Dashboard', 'Zurück zum Dashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(backPath)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Feature-Anfrage</CardTitle>
                <CardDescription>
                  {t(
                    'Dir fehlt etwas? Lass es uns wissen!',
                    'Ihnen fehlt etwas? Lassen Sie es uns wissen!'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t('Was wünschst du dir?', 'Was wünschen Sie sich?')} *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t(
                    'z.B. "Galerie nach Räumen sortieren"',
                    'z.B. "Galerie nach Räumen sortieren"'
                  )}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('Beschreibe deine Idee', 'Beschreiben Sie Ihre Idee')} *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t(
                    'Erkläre, was du brauchst und warum es dir helfen würde...',
                    'Erklären Sie, was Sie brauchen und warum es Ihnen helfen würde...'
                  )}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Priorität</Label>
                <RadioGroup
                  value={priority}
                  onValueChange={(v) => setPriority(v as 'low' | 'normal' | 'high')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="cursor-pointer font-normal">
                      Niedrig
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="cursor-pointer font-normal">
                      Normal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="cursor-pointer font-normal">
                      Hoch
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Screenshot (optional)</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-lg max-h-64 w-full object-contain bg-muted"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t('Klicke zum Hochladen', 'Klicken Sie zum Hochladen')}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={!title || !description || isCreating}
              >
                {isCreating ? 'Wird gesendet...' : t('Anfrage senden', 'Anfrage senden')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
