import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile, storeFile, getInstallerSpecialties, addInstallerSpecialty, removeInstallerSpecialty } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvailabilityCalendar from '@/components/installer/AvailabilityCalendar';
import InstallerSidebar from '@/components/installer/InstallerSidebar';
import SpecialtyManager from '@/components/installer/SpecialtyManager';
import ProfileEditForm from '@/components/installer/ProfileEditForm';

export default function ProfileManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      <InstallerSidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/installer/dashboard')}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-2xl font-bold">Profile Management</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Basic Info</TabsTrigger>
              <TabsTrigger value="specialties">Specialties</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>
            <TabsContent value="profile"><ProfileEditForm /></TabsContent>
            <TabsContent value="specialties"><SpecialtyManager /></TabsContent>
            <TabsContent value="availability"><AvailabilityCalendar /></TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
