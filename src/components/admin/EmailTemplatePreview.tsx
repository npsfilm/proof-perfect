import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle2, Package } from 'lucide-react';

export function EmailTemplatePreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Template Previews
        </CardTitle>
        <CardDescription>
          Data sent to Zapier webhooks for email composition
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>
            These templates show the data structure sent to your Zapier webhooks. Design your Zap email templates using these fields.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send">
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </TabsTrigger>
            <TabsTrigger value="review">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Review Notification
            </TabsTrigger>
            <TabsTrigger value="delivery">
              <Package className="h-4 w-4 mr-2" />
              Final Delivery
            </TabsTrigger>
          </TabsList>

          {/* Send to Client Template */}
          <TabsContent value="send" className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Gallery Sent to Client</h4>
                <Badge>webhook_send</Badge>
              </div>
              <div className="space-y-2 text-sm font-mono">
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">event_type:</span>
                  <span>"gallery_sent_to_client"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">gallery_name:</span>
                  <span>"123 Main Street Property"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">gallery_url:</span>
                  <span className="text-blue-600">"https://yourapp.com/gallery/123-main-st"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">salutation:</span>
                  <span>"Du" | "Sie"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">client_emails:</span>
                  <span>["realtor@example.com", "broker@example.com"]</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">new_passwords:</span>
                  <span>[{'{'}"email": "realtor@example.com", "temp_password": "abc123xyz"{'}'}]</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">timestamp:</span>
                  <span>"2025-01-27T10:30:00Z"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">event_id:</span>
                  <span>"uuid-v4-string"</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Email Content Suggestions:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Welcome message with gallery name</li>
                <li>• Direct link to gallery (gallery_url)</li>
                <li>• Login credentials for new users (temp_password)</li>
                <li>• Instructions to select favorite photos</li>
                <li>• Use appropriate salutation (Du/Sie)</li>
              </ul>
            </div>
          </TabsContent>

          {/* Review Notification Template */}
          <TabsContent value="review" className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Client Reviewed Gallery</h4>
                <Badge variant="secondary">webhook_send (review event)</Badge>
              </div>
              <div className="space-y-2 text-sm font-mono">
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">event_type:</span>
                  <span>"gallery_reviewed"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">gallery_name:</span>
                  <span>"123 Main Street Property"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">selected_count:</span>
                  <span>25</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">staging_count:</span>
                  <span>8</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">admin_email:</span>
                  <span>"admin@agency.com"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">salutation:</span>
                  <span>"Du" | "Sie"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">timestamp:</span>
                  <span>"2025-01-27T14:45:00Z"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">event_id:</span>
                  <span>"uuid-v4-string"</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-900 mb-2">Email Content Suggestions:</h5>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Notification to admin about completed review</li>
                <li>• Summary of selections (selected_count)</li>
                <li>• Number of staging requests (staging_count)</li>
                <li>• Link to admin review interface</li>
                <li>• Next steps for processing</li>
              </ul>
            </div>
          </TabsContent>

          {/* Final Delivery Template */}
          <TabsContent value="delivery" className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Final Files Delivered</h4>
                <Badge variant="default">webhook_deliver</Badge>
              </div>
              <div className="space-y-2 text-sm font-mono">
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">event_type:</span>
                  <span>"gallery_delivered"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">gallery_name:</span>
                  <span>"123 Main Street Property"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">download_link:</span>
                  <span className="text-blue-600">"https://drive.google.com/file/d/..."</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">client_emails:</span>
                  <span>["realtor@example.com", "broker@example.com"]</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">salutation:</span>
                  <span>"Du" | "Sie"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">timestamp:</span>
                  <span>"2025-01-28T09:15:00Z"</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="text-muted-foreground">event_id:</span>
                  <span>"uuid-v4-string"</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Email Content Suggestions:</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Congratulations message for completed project</li>
                <li>• Prominent download link for final edited photos</li>
                <li>• Instructions for accessing files</li>
                <li>• File expiration notice (if applicable)</li>
                <li>• Thank you message and feedback request</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold mb-2">Common Fields in All Templates:</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>• <strong>event_id</strong>: Unique identifier for webhook deduplication</p>
            <p>• <strong>timestamp</strong>: ISO 8601 timestamp of when event occurred</p>
            <p>• <strong>salutation</strong>: Use "Du" for informal, "Sie" for formal German</p>
            <p>• <strong>event_type</strong>: Identifier for routing in Zapier workflows</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
