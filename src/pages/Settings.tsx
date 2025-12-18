import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Settings() {
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
                    {[
                      { name: 'Private Chef', defaultPrice: '$850' },
                      { name: 'Bartender Service', defaultPrice: '$450' },
                      { name: 'Massage Therapy', defaultPrice: '$200' },
                      { name: 'Concierge Service', defaultPrice: '$150' },
                      { name: 'Transportation', defaultPrice: '$300' },
                      { name: 'Photography', defaultPrice: '$500' },
                    ].map((service) => (
                      <div key={service.name}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">{service.name}</p>
                            <p className="text-sm text-muted-foreground">Base rate: {service.defaultPrice}</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">Add Custom Service</Button>
                  </CardContent>
                </Card>
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
                    {[
                      { name: 'Airbnb', status: 'Connected', color: 'text-green-600' },
                      { name: 'Vrbo', status: 'Connected', color: 'text-green-600' },
                      { name: 'Booking.com', status: 'Not Connected', color: 'text-muted-foreground' },
                    ].map((platform) => (
                      <div key={platform.name}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">{platform.name}</p>
                            <p className={`text-sm ${platform.color}`}>{platform.status}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            {platform.status === 'Connected' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                        <Separator />
                      </div>
                    ))}
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
    </Layout>
  );
}
