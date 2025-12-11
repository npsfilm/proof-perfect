import { useState } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesTab } from '@/components/admin/services/CategoriesTab';
import { ServicesTab } from '@/components/admin/services/ServicesTab';
import { PackagesTab } from '@/components/admin/services/PackagesTab';
import { DiscountsTab } from '@/components/admin/services/DiscountsTab';
import { StagingStylesTab } from '@/components/admin/services/StagingStylesTab';
import { RoomTypesTab } from '@/components/admin/services/RoomTypesTab';

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <PageContainer>
      <PageHeader
        title="Services & Pakete"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Services & Pakete' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="services" className="text-xs sm:text-sm">Services</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">Kategorien</TabsTrigger>
          <TabsTrigger value="packages" className="text-xs sm:text-sm">Pakete</TabsTrigger>
          <TabsTrigger value="discounts" className="text-xs sm:text-sm">Rabatte</TabsTrigger>
          <TabsTrigger value="staging-styles" className="text-xs sm:text-sm">Staging-Stile</TabsTrigger>
          <TabsTrigger value="room-types" className="text-xs sm:text-sm">Raumtypen</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="packages">
          <PackagesTab />
        </TabsContent>

        <TabsContent value="discounts">
          <DiscountsTab />
        </TabsContent>

        <TabsContent value="staging-styles">
          <StagingStylesTab />
        </TabsContent>

        <TabsContent value="room-types">
          <RoomTypesTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
