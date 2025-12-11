import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Mail, Users, Newspaper, Send, FileText, Settings } from 'lucide-react';
import { EmailDesignEditor } from './EmailDesignEditor';
import { EmailTemplateList } from './EmailTemplateList';
import { PlaceholderReference } from './PlaceholderReference';
import { EmailTestSender } from './EmailTestSender';
import { EmailGeneralSettings } from './EmailGeneralSettings';

export function EmailSettingsTab() {
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid grid-cols-3 md:grid-cols-7 h-auto gap-1">
        <TabsTrigger value="general" className="flex items-center gap-2 py-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Allgemein</span>
        </TabsTrigger>
        <TabsTrigger value="design" className="flex items-center gap-2 py-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Design</span>
        </TabsTrigger>
        <TabsTrigger value="system" className="flex items-center gap-2 py-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">System</span>
        </TabsTrigger>
        <TabsTrigger value="customer" className="flex items-center gap-2 py-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Kunden</span>
        </TabsTrigger>
        <TabsTrigger value="newsletter" className="flex items-center gap-2 py-2">
          <Newspaper className="h-4 w-4" />
          <span className="hidden sm:inline">Newsletter</span>
        </TabsTrigger>
        <TabsTrigger value="placeholders" className="flex items-center gap-2 py-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Platzhalter</span>
        </TabsTrigger>
        <TabsTrigger value="test" className="flex items-center gap-2 py-2">
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Test</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <EmailGeneralSettings />
      </TabsContent>

      <TabsContent value="design">
        <EmailDesignEditor />
      </TabsContent>

      <TabsContent value="system">
        <EmailTemplateList category="system" />
      </TabsContent>

      <TabsContent value="customer">
        <EmailTemplateList category="customer" />
      </TabsContent>

      <TabsContent value="newsletter">
        <EmailTemplateList category="newsletter" />
      </TabsContent>

      <TabsContent value="placeholders">
        <PlaceholderReference />
      </TabsContent>

      <TabsContent value="test">
        <EmailTestSender />
      </TabsContent>
    </Tabs>
  );
}
