import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Link2, ExternalLink, Copy, Check } from 'lucide-react';
import { PropertiesPageSkeleton } from '@/components/skeletons/PropertiesListSkeleton';
import { usePropertiesQuery, propertyMappers, useCreatePropertyMutation, createPropertySchema, type PropertyView, type PropertyListingView, type CreatePropertyFormData } from '@/lib/api/property';
import { useToast } from '@/components/ui/use-toast';

export default function Properties() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [copiedPropertyId, setCopiedPropertyId] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePropertyFormData>({
    resolver: yupResolver(createPropertySchema),
    defaultValues: {
      name: '',
      address: '',
      status: 'active',
      airbnb_id: '',
      vrbo_id: '',
      booking_id: '',
    },
  });

  const createPropertyMutation = useCreatePropertyMutation({
    onSuccess: () => {
      toast({
        title: 'Property created successfully',
        description: 'Your new property has been added to the system.',
      });
      setIsCreateDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast({
        title: 'Error creating property',
        description: error.message || 'Failed to create property. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const page = 1;
  const limit = 10;
  const { data, isLoading } = usePropertiesQuery(page, limit);
  const apiItems = data?.data?.data ?? [];
  const properties: PropertyView[] = apiItems.map(propertyMappers.toViewProperty);
  const listings: PropertyListingView[] = apiItems.flatMap(propertyMappers.toPropertyListings);
  console.log(properties, 'dddd')

  const getPropertyListings = (propertyId: string) => {
    return listings.filter(l => l.propertyId === propertyId);
  };

  const statusColors = {
    Active: 'bg-green-500 text-white',
    Inactive: 'bg-muted text-muted-foreground',
    Maintenance: 'bg-orange-500 text-white',
  };

  const onSubmit = (data: CreatePropertyFormData) => {
    createPropertyMutation.mutate({
      name: data.name,
      address: data.address,
      status: data.status,
      airbnb_id: data.airbnb_id || undefined,
      vrbo_id: data.vrbo_id || undefined,
      booking_id: data.booking_id || undefined,
    });
  };

  const copyICalUrl = async (propertyId: string, iCalUrl: string) => {
    if (!iCalUrl) {
      toast({
        title: 'No iCal URL',
        description: 'This property does not have an iCal feed URL.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(iCalUrl);
      setCopiedPropertyId(propertyId);
      toast({
        title: 'iCal URL Copied',
        description: 'The iCal feed URL has been copied to your clipboard.',
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedPropertyId(null), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy the iCal URL. Please try again.',
        variant: 'destructive',
      });
    }
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Property Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter property name" 
                        {...register('name')}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        placeholder="Enter property address" 
                        {...register('address')}
                        className={errors.address ? 'border-destructive' : ''}
                      />
                      {errors.address && (
                        <p className="text-sm text-destructive">{errors.address.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        onValueChange={(value) => setValue('status', value as "active" | "inactive" | "maintenance")}
                        defaultValue="active"
                      >
                        <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-destructive">{errors.status.message}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label>Platform Listing IDs</Label>
                      <p className="text-sm text-muted-foreground">
                        Enter the unique listing ID for each platform to link them to this property
                      </p>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3">
                          <Label htmlFor="airbnb_id" className="w-32 text-right">Airbnb</Label>
                          <Input 
                            id="airbnb_id" 
                            placeholder="Airbnb listing ID" 
                            {...register('airbnb_id')}
                            className={errors.airbnb_id ? 'border-destructive' : ''}
                          />
                        </div>
                        {errors.airbnb_id && (
                          <p className="text-sm text-destructive ml-36">{errors.airbnb_id.message}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <Label htmlFor="vrbo_id" className="w-32 text-right">Vrbo</Label>
                          <Input 
                            id="vrbo_id" 
                            placeholder="Vrbo listing ID" 
                            {...register('vrbo_id')}
                            className={errors.vrbo_id ? 'border-destructive' : ''}
                          />
                        </div>
                        {errors.vrbo_id && (
                          <p className="text-sm text-destructive ml-36">{errors.vrbo_id.message}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <Label htmlFor="booking_id" className="w-32 text-right">Booking.com</Label>
                          <Input 
                            id="booking_id" 
                            placeholder="Booking.com listing ID" 
                            {...register('booking_id')}
                            className={errors.booking_id ? 'border-destructive' : ''}
                          />
                        </div>
                        {errors.booking_id && (
                          <p className="text-sm text-destructive ml-36">{errors.booking_id.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting || createPropertyMutation.isPending}
                    >
                      {isSubmitting || createPropertyMutation.isPending ? 'Creating...' : 'Create Property'}
                    </Button>
                  </div>
                </form>
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
                            <Badge className={`text-xs ${syncStatusColors['Synced']}`}>
                              {'Synced'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {property.iCalUrl && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">iCal Feed URL</p>
                            <p className="text-xs text-muted-foreground truncate font-mono">
                              {property.iCalUrl}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyICalUrl(property.id, property.iCalUrl)}
                            className="ml-2 h-8 w-8"
                          >
                            {copiedPropertyId === property.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

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
