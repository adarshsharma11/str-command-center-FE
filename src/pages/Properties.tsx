import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Link2, ExternalLink, Copy, Check, Trash2, BedDouble, DollarSign, Loader2 } from 'lucide-react';
import { PropertiesPageSkeleton } from '@/components/skeletons/PropertiesListSkeleton';
import { usePropertiesQuery, propertyMappers, useCreatePropertyMutation, useDeletePropertyMutation, useUpdatePropertyMutation, createPropertySchema, type PropertyView, type PropertyListingView, type UpdatePropertyPayload } from '@/lib/api/property';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchOwners } from '@/lib/api/reports';

type CreatePropertyFormData = {
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'maintenance';
  bedrooms: number;
  base_price: number;
  owner_id?: number | null;
  new_owner_first_name?: string;
  new_owner_last_name?: string;
  new_owner_email?: string;
  airbnb_id?: string;
  vrbo_id?: string;
  booking_id?: string;
};

export default function Properties() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<{id: string, name: string} | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddListingDialogOpen, setIsAddListingDialogOpen] = useState(false);
  const [newListingPlatform, setNewListingPlatform] = useState<string>('');
  const [newListingId, setNewListingId] = useState<string>('');
  const [copiedPropertyId, setCopiedPropertyId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePropertyFormData>({
    resolver: yupResolver(createPropertySchema) as unknown as Resolver<CreatePropertyFormData>,
    defaultValues: {
      name: '',
      address: '',
      status: 'active',
      bedrooms: 0,
      base_price: 0,
      owner_id: null,
      airbnb_id: '',
      vrbo_id: '',
      booking_id: '',
    },
  });

  // Fetch owners for the selection dropdown
  const { data: ownersData } = useQuery({
    queryKey: ['owners'],
    queryFn: fetchOwners,
    staleTime: 5 * 60_000,
  });
  const owners = ownersData?.data ?? [];

  const createPropertyMutation = useCreatePropertyMutation({
    onSuccess: () => {
      toast({
        title: 'Property created successfully',
        description: 'Your new property has been added to the system.',
      });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
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

  const updatePropertyMutation = useUpdatePropertyMutation({
    onSuccess: () => {
      toast({
        title: 'Property updated',
        description: 'The listing connection has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsAddListingDialogOpen(false);
      setNewListingPlatform('');
      setNewListingId('');
    },
    onError: (error) => {
      toast({
        title: 'Error updating property',
        description: error.message || 'Failed to update property. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAddListingConnection = () => {
     if (!selectedProperty || !newListingPlatform || !newListingId) return;
 
     const updateData: UpdatePropertyPayload = { 
       id: selectedProperty,
       airbnb_id: newListingPlatform === 'Airbnb' ? newListingId : undefined,
       vrbo_id: newListingPlatform === 'Vrbo' ? newListingId : undefined,
       booking_id: newListingPlatform === 'Booking.com' ? newListingId : undefined,
     };
 
     updatePropertyMutation.mutate(updateData);
   };

  const deletePropertyMutation = useDeletePropertyMutation({
    onSuccess: () => {
      toast({
        title: 'Property deleted',
        description: 'The property has been successfully removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setPropertyToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error deleting property',
        description: error.message || 'Failed to delete property. It might have active dependencies.',
        variant: 'destructive',
      });
      setPropertyToDelete(null);
    }
  });

  const handleDeleteConfirm = () => {
    if (propertyToDelete) {
      deletePropertyMutation.mutate(propertyToDelete.id);
    }
  };

  const page = 1;
  const limit = 10;
  const { data, isLoading } = usePropertiesQuery(page, limit);
  const apiItems = data?.data ?? [];
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

  const onSubmit = (data: CreatePropertyFormData) => {
    createPropertyMutation.mutate({
      name: data.name,
      address: data.address,
      status: data.status,
      bedrooms: data.bedrooms,
      base_price: data.base_price,
      owner_id: data.owner_id || undefined,
      airbnb_id: data.airbnb_id || undefined,
      vrbo_id: data.vrbo_id || undefined,
      booking_id: data.booking_id || undefined,
      new_owner_first_name: data.new_owner_first_name,
      new_owner_last_name: data.new_owner_last_name,
      new_owner_email: data.new_owner_email
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
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(iCalUrl);
      } else {
        // Fallback for non-secure contexts (HTTP)
        const textArea = document.createElement("textarea");
        textArea.value = iCalUrl;
        
        // Ensure textarea is not visible but still part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy failed');
        }
      }
      
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
                  <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Add New Property</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Rooms</Label>
                        <Input 
                          id="bedrooms" 
                          type="number"
                          placeholder="Number of rooms" 
                          {...register('bedrooms', { valueAsNumber: true })}
                          className={errors.bedrooms ? 'border-destructive' : ''}
                        />
                        {errors.bedrooms && (
                          <p className="text-sm text-destructive">{errors.bedrooms.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="base_price">Base Price ($)</Label>
                        <Input 
                          id="base_price" 
                          type="number"
                          placeholder="Base price per night" 
                          {...register('base_price', { valueAsNumber: true })}
                          className={errors.base_price ? 'border-destructive' : ''}
                        />
                        {errors.base_price && (
                          <p className="text-sm text-destructive">{errors.base_price.message}</p>
                        )}
                      </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="owner_id">Owner</Label>
                      <Select 
                        onValueChange={(value) => setValue('owner_id', parseInt(value))}
                      >
                        <SelectTrigger id="owner_id" className={errors.owner_id ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select owner (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          <SelectItem value="-1" className="font-semibold text-primary">+ Add New Owner</SelectItem>
                          {owners.map((owner) => (
                            <SelectItem key={owner.id} value={String(owner.id)}>
                              {owner.first_name} {owner.last_name} ({owner.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.owner_id && (
                        <p className="text-sm text-destructive">{errors.owner_id.message}</p>
                      )}
                    </div>

                    {watch('owner_id') === -1 && (
                      <div className="p-4 border rounded-lg bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-semibold">New Owner Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new_owner_first_name">First Name</Label>
                            <Input 
                              id="new_owner_first_name" 
                              placeholder="First name" 
                              {...register('new_owner_first_name')}
                              className={errors.new_owner_first_name ? 'border-destructive' : ''}
                            />
                            {errors.new_owner_first_name && (
                              <p className="text-sm text-destructive">{errors.new_owner_first_name.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new_owner_last_name">Last Name</Label>
                            <Input 
                              id="new_owner_last_name" 
                              placeholder="Last name" 
                              {...register('new_owner_last_name')}
                              className={errors.new_owner_last_name ? 'border-destructive' : ''}
                            />
                            {errors.new_owner_last_name && (
                              <p className="text-sm text-destructive">{errors.new_owner_last_name.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new_owner_email">Email Address</Label>
                          <Input 
                            id="new_owner_email" 
                            type="email"
                            placeholder="owner@example.com" 
                            {...register('new_owner_email')}
                            className={errors.new_owner_email ? 'border-destructive' : ''}
                          />
                          {errors.new_owner_email && (
                            <p className="text-sm text-destructive">{errors.new_owner_email.message}</p>
                          )}
                        </div>
                      </div>
                    )}
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
                  <div className="flex justify-end gap-2 px-6 py-4 border-t">
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
                <Card key={property.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[property.internalStatus]}>
                          {property.internalStatus}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setPropertyToDelete({ id: property.id, name: property.name })}
                          disabled={deletePropertyMutation.isPending && propertyToDelete?.id === property.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                          <BedDouble className="h-3.5 w-3.5" />
                          <span>{property.bedrooms} {property.bedrooms === 1 ? 'Room' : 'Rooms'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>${property.basePrice} <span className="opacity-70 font-normal">/ night</span></span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Connected Listings</p>
                        <div className="space-y-2">
                          {propertyListings.length > 0 ? (
                            propertyListings.map((listing) => (
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
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic bg-accent/30 p-2 rounded">No platforms connected</p>
                          )}
                        </div>
                      </div>

                      {property.iCalUrl && (
                        <div className="pt-4 border-t border-border">
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
                    </div>

                    <div className="pt-2 mt-auto">
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

                          <Button 
                            className="w-full gap-2"
                            onClick={() => setIsAddListingDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                            Add New Listing Connection
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Listing Connection Modal */}
      <Dialog open={isAddListingDialogOpen} onOpenChange={setIsAddListingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Listing Connection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={newListingPlatform} onValueChange={setNewListingPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const connectedPlatforms = selectedProperty 
                      ? getPropertyListings(selectedProperty).map(l => l.platformName) 
                      : [];
                    return (
                      <>
                        <SelectItem value="Airbnb" disabled={connectedPlatforms.includes('Airbnb')}>Airbnb</SelectItem>
                        <SelectItem value="Vrbo" disabled={connectedPlatforms.includes('Vrbo')}>Vrbo</SelectItem>
                        <SelectItem value="Booking.com" disabled={connectedPlatforms.includes('Booking.com')}>Booking.com</SelectItem>
                      </>
                    );
                  })()}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="listingId">Listing ID</Label>
              <Input
                id="listingId"
                placeholder="Enter external listing ID"
                value={newListingId}
                onChange={(e) => setNewListingId(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddListingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddListingConnection}
              disabled={!newListingPlatform || !newListingId || updatePropertyMutation.isPending}
            >
              {updatePropertyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Listing'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog 
        open={!!propertyToDelete} 
        onOpenChange={(open) => !open && !deletePropertyMutation.isPending && setPropertyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{propertyToDelete?.name}</strong> and remove its data from the system. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePropertyMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { 
                e.preventDefault(); 
                handleDeleteConfirm(); 
              }}
              disabled={deletePropertyMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deletePropertyMutation.isPending ? 'Deleting...' : 'Delete Property'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
