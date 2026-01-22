import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
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
import { 
  useIntegrationUsersQuery,
  useCreateIntegrationUserMutation,
  useConnectIntegrationUserMutation,
  useUpdatePlatformCredentialsMutation,
  type IntegrationUser
} from '@/lib/api/integrations';
import { UserIntegrationDialog } from '@/components/integrations/UserIntegrationDialog';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isUserIntegrationModalOpen, setIsUserIntegrationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IntegrationUser | null>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('america-new-york');
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem('business_profile');
      if (raw) {
        const p = JSON.parse(raw);
        setBusinessName(p.businessName || '');
        setContactEmail(p.contactEmail || '');
        setPhone(p.phone || '');
        setCurrency(p.currency || 'USD');
        setTimezone(p.timezone || 'america-new-york');
      }
    } catch { /* noop */ }
  }, []);
  const handleSaveBusiness = () => {
    try {
      const payload = { businessName, contactEmail, phone, currency, timezone };
      localStorage.setItem('business_profile', JSON.stringify(payload));
      toast({ title: 'Saved', description: 'Business profile updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save business profile.', variant: 'destructive' });
    }
  };
  
  const { data: serviceCategoriesData, isLoading: isLoadingServices } = useServiceCategoriesQuery();
  const { data: usersData, isLoading: isLoadingUsers } = useIntegrationUsersQuery();
  
  const updateServiceStatusMutation = useUpdateServiceCategoryStatusMutation({
    onSuccess: () => {
      toast({ title: 'Status updated', description: 'Service category status has been updated.' });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const createUserMutation = useCreateIntegrationUserMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'User integration added successfully.' });
      queryClient.invalidateQueries({ queryKey: ['integration-users'] });
      setIsUserIntegrationModalOpen(false);
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message || 'Failed to add user integration.', variant: 'destructive' });
    }
  });

  const updatePlatformMutation = useUpdatePlatformCredentialsMutation({
    onSuccess: (data) => {
      toast({ title: 'Success', description: data.message || 'Platform credentials updated.' });
      queryClient.invalidateQueries({ queryKey: ['integration-users'] });
      setIsUserIntegrationModalOpen(false);
      setSelectedUser(null);
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message || 'Failed to update platform credentials.', variant: 'destructive' });
    }
  });

  const connectUserMutation = useConnectIntegrationUserMutation({
    onSuccess: (data) => {
      toast({ title: 'Success', description: data.message || 'Connection successful.' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message || 'Connection failed.', variant: 'destructive' });
    }
  });

  const handleSubmitUserIntegration = async (values: { email: string; password: string }) => {
    if (selectedUser?.platform) {
      await updatePlatformMutation.mutateAsync({ platform: selectedUser.platform, credentials: values });
    } else {
      await createUserMutation.mutateAsync(values);
    }
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
            <Tabs defaultValue="integrations" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              {/* Business Tab */}
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
                      <Input id="business-name" placeholder="Luxury Retreats International" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input id="contact-email" type="email" placeholder="contact@luxuryretreats.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
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
                        <Select value={timezone} onValueChange={setTimezone}>
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
                    <Button onClick={handleSaveBusiness}>Save Business Profile</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
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
                      <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="h-4 w-40 bg-muted rounded" />
                                <div className="h-3 w-64 bg-muted rounded" />
                              </div>
                              <div className="h-6 w-12 bg-muted rounded" />
                            </div>
                            <Separator />
                          </div>
                        ))}
                      </div>
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

              {/* Integrations Tab */}
              <TabsContent value="integrations" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Integrations</CardTitle>
                        <CardDescription>
                          Manage your connected platforms and user accounts
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoadingUsers ? (
                      <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="space-y-2">
                                <div className="h-4 w-32 bg-muted rounded" />
                                <div className="h-3 w-56 bg-muted rounded" />
                                <div className="h-3 w-24 bg-muted rounded" />
                              </div>
                              <div className="h-8 w-20 bg-muted rounded" />
                            </div>
                            <Separator />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {usersData?.data?.map((user, index) => (
                          <div key={user.email + index}>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                {user.platform && (
                                    <p className="font-medium text-foreground capitalize">{user.platform}</p>
                                )}
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <p className={`text-sm ${user.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}>
                                  Status: {user.status}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsUserIntegrationModalOpen(true);
                                }}
                              >
                                Configure
                              </Button>
                            </div>
                            <Separator />
                          </div>
                        ))}
                        {!usersData?.data?.length && (
                             <div className="text-center py-4 text-muted-foreground">
                                No integrations found.
                             </div>
                        )}
                      </>
                    )}
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

              {/* Notifications Tab */}
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

        <UserIntegrationDialog 
          open={isUserIntegrationModalOpen}
          onOpenChange={setIsUserIntegrationModalOpen}
          onSubmit={handleSubmitUserIntegration}
          isSubmitting={createUserMutation.isPending || updatePlatformMutation.isPending}
          user={selectedUser}
          onTestConnection={(email) => connectUserMutation.mutate(email)}
          onConnect={(email) => connectUserMutation.mutate(email)}
        />

      </div>
    </Layout>
  );
}
