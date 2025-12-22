import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceCategoryDialog } from '@/components/settings/ServiceCategoryDialog';
import { 
  useServiceCategoriesQuery, 
  useUpdateServiceCategoryStatusMutation,
  type ServiceCategory
} from '@/lib/api/service-category';
import { PlatformConfigModal } from '@/components/integrations/PlatformConfigModal';
import { 
  useConnectIntegrationMutation, 
  useDisconnectIntegrationMutation,
  useTestConnectionMutation,
  type PlatformType,
  type PlatformCredentials 
} from '@/lib/api/integrations';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<{ platform: PlatformType; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  
  const { data: serviceCategoriesData, isLoading: isLoadingServices } = useServiceCategoriesQuery();
  const updateServiceStatusMutation = useUpdateServiceCategoryStatusMutation({
    onSuccess: () => {
      toast({ title: 'Status updated', description: 'Service category status has been updated.' });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<PlatformType, { status: 'connected' | 'not_connected'; email?: string }>>({
    airbnb: { status: 'not_connected' },
    vrbo: { status: 'not_connected' },
    booking_com: { status: 'not_connected' },
    stripe: { status: 'not_connected' },
  });

  // Mutations
  const connectMutation = useConnectIntegrationMutation({
    onSuccess: (data) => {
      if (selectedPlatform) {
        setConnectedPlatforms(prev => ({
          ...prev,
          [selectedPlatform.platform]: {
            status: 'connected',
            email: data.data?.email || connectedPlatforms[selectedPlatform.platform]?.email,
          }
        }));
      }
      toast({
        title: 'Success',
        description: 'Platform connected successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect platform',
        variant: 'destructive',
      });
    },
  });

  const disconnectMutation = useDisconnectIntegrationMutation({
    onSuccess: () => {
      if (selectedPlatform) {
        setConnectedPlatforms(prev => ({
          ...prev,
          [selectedPlatform.platform]: { status: 'not_connected', email: undefined }
        }));
      }
      toast({
        title: 'Success',
        description: 'Platform disconnected successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Disconnect failed',
        description: error.message || 'Failed to disconnect platform',
        variant: 'destructive',
      });
    },
  });

  const testMutation = useTestConnectionMutation({
    onSuccess: () => {
      toast({
        title: 'Connection test successful',
        description: 'Platform connection is working',
      });
    },
    onError: (error) => {
      toast({
        title: 'Connection test failed',
        description: error.message || 'Failed to test connection',
        variant: 'destructive',
      });
    },
  });

  // Platform configurations
  const platforms = [
    { platform: 'airbnb' as PlatformType, name: 'Airbnb' },
    { platform: 'vrbo' as PlatformType, name: 'Vrbo' },
    { platform: 'booking_com' as PlatformType, name: 'Booking.com' },
  ];

  const handleConnect = async (credentials: PlatformCredentials) => {
    if (!selectedPlatform) return;
    
    await connectMutation.mutateAsync({
      platform: selectedPlatform.platform,
      credentials,
    });
  };

  // ============================================================
  // TEST CONNECTION HANDLER
  // Tests if provided credentials can connect to the platform
  // Returns true if connection successful, false otherwise
  // ============================================================
  const handleTestConnection = async (credentials: PlatformCredentials): Promise<boolean> => {
    if (!selectedPlatform) return false;
    
    try {
      const result = await testMutation.mutateAsync({
        platform: selectedPlatform.platform,
        credentials,
      });
      
      // Check if status exists on the result data
      return result.data?.status === 'success';
    } catch {
      return false;
    }
  };

  const handleDisconnect = async () => {
    if (!selectedPlatform) return;
    
    await disconnectMutation.mutateAsync(selectedPlatform.platform);
  };

  const getIntegrationStatus = (platform: PlatformType) => {
    return connectedPlatforms[platform].status;
  };

  const getIntegrationEmail = (platform: PlatformType) => {
    return connectedPlatforms[platform].email || '';
  };

  const handleConfigureClick = (platform: PlatformType, name: string) => {
    setSelectedPlatform({ platform, name });
    setIsModalOpen(true);
  };



  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your luxury rental business configuration</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="business" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="business" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>
                      Configure your luxury rental business details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input id="business-name" placeholder="Luxury Retreats International" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input id="contact-email" type="email" placeholder="contact@luxuryretreats.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select defaultValue="USD">
                          <SelectTrigger id="currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="america-new-york">
                          <SelectTrigger id="timezone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="america-new-york">America/New York</SelectItem>
                            <SelectItem value="europe-london">Europe/London</SelectItem>
                            <SelectItem value="asia-tokyo">Asia/Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button>Save Business Profile</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Luxury Services Configuration</CardTitle>
                    <CardDescription>
                      Manage available services and pricing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoadingServices ? (
                       <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                      <>
                        {serviceCategoriesData?.data?.map((service) => (
                          <div key={service.id}>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground">{service.category_name}</p>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6" 
                                    onClick={() => {
                                      setEditingCategory(service);
                                      setIsServiceModalOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {service.price ? `Base rate: $${service.price}` : 'No base rate'}
                                  {service.time && ` • ${service.time}`}
                                  {service.email && ` • Email: ${service.email}`}
                                  {service.phone && ` • Phone: ${service.phone}`}
                                </p>
                              </div>
                              <Switch 
                                checked={service.status} 
                                onCheckedChange={(checked) => updateServiceStatusMutation.mutate({ id: service.id, isActive: checked })}
                              />
                            </div>
                            <Separator />
                          </div>
                        ))}
                        
                        {!serviceCategoriesData?.data?.length && (
                          <div className="text-center py-4 text-muted-foreground">
                            No service categories found. Add one to get started.
                          </div>
                        )}

                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => {
                            setEditingCategory(null);
                            setIsServiceModalOpen(true);
                          }}
                        >
                          Add Service Category
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
                <ServiceCategoryDialog 
                  open={isServiceModalOpen} 
                  onOpenChange={setIsServiceModalOpen}
                  categoryToEdit={editingCategory}
                />
              </TabsContent>

              <TabsContent value="integrations" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Integrations</CardTitle>
                    <CardDescription>
                      Connect to booking platforms and channel managers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {platforms.map(({ platform, name }) => {
                      const status = getIntegrationStatus(platform);
                      const email = getIntegrationEmail(platform);
                      const isConnected = status === 'connected';
                      
                      return (
                        <div key={platform}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-foreground">{name}</p>
                              <p className={`text-sm ${
                                isConnected ? 'text-green-600' : 'text-muted-foreground'
                              }`}>
                                {isConnected 
                                  ? (email ? `Connected: ${email}` : 'Connected') 
                                  : 'Not Connected'
                                }
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConfigureClick(platform, name)}
                            >
                              {isConnected ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                          <Separator />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Processing</CardTitle>
                    <CardDescription>
                      Configure payment gateways
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-key">Stripe API Key</Label>
                      <Input
                        id="stripe-key"
                        type="password"
                        placeholder="sk_live_..."
                      />
                    </div>
                    <Button variant="outline">Test Connection</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive updates and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { title: 'New Bookings', desc: 'Receive notifications for new reservations' },
                      { title: 'Service Requests', desc: 'Get alerted when guests request luxury services' },
                      { title: 'Payment Updates', desc: 'Notifications for payment status changes' },
                      { title: 'Guest Messages', desc: 'Receive guest communication alerts' },
                      { title: 'Maintenance Issues', desc: 'Critical property maintenance alerts' },
                      { title: 'Daily Summary', desc: 'Daily digest of all activities' },
                    ].map((notification) => (
                      <div key={notification.title}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.desc}</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Methods</CardTitle>
                    <CardDescription>
                      Configure how notifications are delivered
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="alerts@luxuryretreats.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sms">SMS Number</Label>
                      <Input id="sms" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                    <Button>Update Contact Methods</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Platform Configuration Modal */}
      {selectedPlatform && (
        <PlatformConfigModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          platform={selectedPlatform.platform}
          platformName={selectedPlatform.name}
          currentEmail={getIntegrationEmail(selectedPlatform.platform)}
          isConnected={getIntegrationStatus(selectedPlatform.platform) === 'connected'}
          onConnect={handleConnect}
          onTestConnection={handleTestConnection}
          onDisconnect={handleDisconnect}
        />
      )}


    </Layout>
  );
}
