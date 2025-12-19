import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Link2, ExternalLink } from 'lucide-react';
import { PropertiesPageSkeleton } from '@/components/skeletons/PropertiesListSkeleton';
import { usePropertiesQuery, propertyMappers, type PropertyView, type PropertyListingView } from '@/lib/api/property';

export default function Properties() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const page = 1;
  const limit = 10;
  const { data, isLoading } = usePropertiesQuery(page, limit);
  const apiItems = data?.data?.data ?? [];
  const properties: PropertyView[] = apiItems.map(propertyMappers.toViewProperty);
  const listings: PropertyListingView[] = apiItems.flatMap(propertyMappers.toPropertyListings);

  const getPropertyListings = (propertyId: string) => {
    return listings.filter(l => l.propertyId === propertyId);
  };

  const statusColors = {
    Active: 'bg-green-500 text-white',
    Inactive: 'bg-muted text-muted-foreground',
    Maintenance: 'bg-orange-500 text-white',
  };

  const syncStatusColors = {
    Synced: 'bg-green-500 text-white',
    Error: 'bg-destructive text-destructive-foreground',
    Pending: 'bg-yellow-500 text-white',
  };

  return (
    <Layout>
      {isLoading ? (
        <PropertiesPageSkeleton />
      ) : (
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Properties</h1>
              <p className="text-muted-foreground">Manage your rental properties</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="property-name">Property Name</Label>
                    <Input id="property-name" placeholder="Enter property name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-address">Address</Label>
                    <Input id="property-address" placeholder="Enter property address" />
                  </div>
                  <div className="space-y-3">
                    <Label>Platform Listing IDs</Label>
                    <p className="text-sm text-muted-foreground">
                      Enter the unique listing ID for each platform to link them to this property
                    </p>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="airbnb-id" className="w-32 text-right">Airbnb</Label>
                        <Input id="airbnb-id" placeholder="Airbnb listing ID" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor="vrbo-id" className="w-32 text-right">Vrbo</Label>
                        <Input id="vrbo-id" placeholder="Vrbo listing ID" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor="booking-id" className="w-32 text-right">Booking.com</Label>
                        <Input id="booking-id" placeholder="Booking.com listing ID" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor="direct-id" className="w-32 text-right">Direct Website</Label>
                        <Input id="direct-id" placeholder="Direct booking ID" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button>Create Property</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => {
              const propertyListings = getPropertyListings(property.id);
              
              return (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <Badge className={statusColors[property.internalStatus]}>
                        {property.internalStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{property.address}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Connected Listings</p>
                      <div className="space-y-2">
                        {propertyListings.map((listing) => (
                          <div
                            key={listing.id}
                            className="flex items-center justify-between p-2 rounded bg-accent/50"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {listing.platformName}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Trust: {listing.trustScore}%
                              </span>
                            </div>
                            <Badge className={`text-xs ${syncStatusColors[listing.syncStatus]}`}>
                              {listing.syncStatus}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => setSelectedProperty(property.id)}
                        >
                          <Link2 className="h-4 w-4" />
                          Manage Listings
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Property Linking - {property.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Map external OTA listings to this property
                          </p>
                          
                          {propertyListings.map((listing) => (
                            <div
                              key={listing.id}
                              className="p-4 rounded-lg border border-border"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-foreground">
                                    {listing.platformName}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    ID: {listing.platformListingId}
                                  </p>
                                </div>
                                <Button variant="ghost" size="icon">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={syncStatusColors[listing.syncStatus]}>
                                  {listing.syncStatus}
                                </Badge>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Trust Score</span>
                                    <span className="font-semibold">{listing.trustScore}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                                    <div
                                      className="bg-primary h-2 rounded-full"
                                      style={{ width: `${listing.trustScore}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Last synced: {listing.lastSyncedAt.toLocaleString()}
                              </p>
                            </div>
                          ))}

                          <Button className="w-full gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Listing Connection
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
}
