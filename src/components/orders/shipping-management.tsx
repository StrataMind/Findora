'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import shippingTracker, { CarrierConfig, ShippingRate, TrackingAPIResponse } from '@/lib/shipping-tracker'
import { DeliveryPartner, ShippingStatus } from '@/lib/order-management'
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Star,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  ExternalLink,
  Download,
  Plus,
  Edit,
  Trash2,
  Copy,
  Send
} from 'lucide-react'
import { format } from 'date-fns'

interface ShippingManagementProps {
  orderId: string
  orderValue: number
  packageWeight: number
  pickupPincode: string
  deliveryPincode: string
  onShipmentCreated: (trackingInfo: any) => void
  existingTrackingId?: string
  existingCarrier?: DeliveryPartner
}

export default function ShippingManagement({
  orderId,
  orderValue,
  packageWeight,
  pickupPincode,
  deliveryPincode,
  onShipmentCreated,
  existingTrackingId,
  existingCarrier
}: ShippingManagementProps) {
  const [carriers] = useState<CarrierConfig[]>(shippingTracker.getCarriers())
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedCarrier, setSelectedCarrier] = useState<DeliveryPartner | ''>('')
  const [trackingInfo, setTrackingInfo] = useState<TrackingAPIResponse | null>(null)
  const [isCreatingShipment, setIsCreatingShipment] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [packageDetails, setPackageDetails] = useState({
    weight: packageWeight,
    length: 25,
    width: 20,
    height: 15,
    fragile: false,
    insurance: false,
    codAmount: 0,
    description: 'E-commerce package'
  })
  const [newTrackingEvent, setNewTrackingEvent] = useState({
    status: 'in_transit' as ShippingStatus,
    location: '',
    description: '',
    remarks: ''
  })

  useEffect(() => {
    loadShippingRates()
  }, [packageWeight, pickupPincode, deliveryPincode])

  useEffect(() => {
    if (existingTrackingId && existingCarrier) {
      trackPackage(existingCarrier, existingTrackingId)
    }
  }, [existingTrackingId, existingCarrier])

  const loadShippingRates = async () => {
    try {
      const rates = await shippingTracker.calculateRates(
        pickupPincode,
        deliveryPincode,
        packageDetails.weight,
        packageDetails.codAmount > 0 ? packageDetails.codAmount : undefined
      )
      setShippingRates(rates)
    } catch (error) {
      console.error('Failed to load shipping rates:', error)
    }
  }

  const trackPackage = async (carrierId: DeliveryPartner, trackingId: string) => {
    setIsTracking(true)
    try {
      const response = await shippingTracker.trackPackage(carrierId, trackingId)
      setTrackingInfo(response)
    } catch (error) {
      console.error('Failed to track package:', error)
    } finally {
      setIsTracking(false)
    }
  }

  const createShipment = async () => {
    if (!selectedCarrier) return

    setIsCreatingShipment(true)
    try {
      const result = await shippingTracker.createShipment({
        orderId,
        pickupAddress: {
          name: 'Findora Warehouse',
          phone: '+91-9876543210',
          email: 'warehouse@findora.com',
          addressLine1: '123 Business District',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: pickupPincode
        },
        deliveryAddress: {
          name: 'Customer Name', // TODO: Get from order
          phone: '+91-1234567890', // TODO: Get from order
          addressLine1: 'Customer Address', // TODO: Get from order
          city: 'Delhi',
          state: 'Delhi',
          pincode: deliveryPincode
        },
        packageDetails: {
          weight: packageDetails.weight,
          dimensions: {
            length: packageDetails.length,
            width: packageDetails.width,
            height: packageDetails.height
          },
          value: orderValue,
          description: packageDetails.description,
          fragile: packageDetails.fragile
        },
        preferences: {
          preferredCarrier: selectedCarrier,
          deliverySpeed: 'standard',
          cashOnDelivery: packageDetails.codAmount > 0,
          codAmount: packageDetails.codAmount > 0 ? packageDetails.codAmount : undefined,
          insurance: packageDetails.insurance
        }
      })

      if (result.success && result.trackingId) {
        onShipmentCreated({
          trackingId: result.trackingId,
          carrierId: selectedCarrier,
          estimatedDelivery: result.estimatedDelivery
        })
        
        // Track the newly created shipment
        await trackPackage(selectedCarrier, result.trackingId)
      }
    } catch (error) {
      console.error('Failed to create shipment:', error)
    } finally {
      setIsCreatingShipment(false)
    }
  }

  const addTrackingEvent = async () => {
    if (!newTrackingEvent.location || !newTrackingEvent.description) return

    try {
      // TODO: Implement manual tracking event addition
      console.log('Adding manual tracking event:', newTrackingEvent)
      
      setNewTrackingEvent({
        status: 'in_transit',
        location: '',
        description: '',
        remarks: ''
      })
      
      // Refresh tracking info
      if (existingTrackingId && existingCarrier) {
        await trackPackage(existingCarrier, existingTrackingId)
      }
    } catch (error) {
      console.error('Failed to add tracking event:', error)
    }
  }

  const getStatusBadgeColor = (status: ShippingStatus) => {
    const colors = {
      not_shipped: 'bg-gray-100 text-gray-800',
      preparing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      delivery_failed: 'bg-red-100 text-red-800',
      returned: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Shipping Rates */}
      {!existingTrackingId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Shipping Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shippingRates.map((rate) => (
                <div
                  key={rate.carrierId}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedCarrier === rate.carrierId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedCarrier(rate.carrierId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={selectedCarrier === rate.carrierId}
                        onChange={() => setSelectedCarrier(rate.carrierId)}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{rate.carrierName}</h3>
                          {rate.recommended && (
                            <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {rate.estimatedDays} days • {rate.features.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{rate.cost}</p>
                      <p className="text-sm text-gray-600">+ taxes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Package Details */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Package Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={packageDetails.weight}
                    onChange={(e) => setPackageDetails({ ...packageDetails, weight: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="value">Package Value (₹)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={orderValue}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={packageDetails.length}
                    onChange={(e) => setPackageDetails({ ...packageDetails, length: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={packageDetails.width}
                    onChange={(e) => setPackageDetails({ ...packageDetails, width: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={packageDetails.height}
                    onChange={(e) => setPackageDetails({ ...packageDetails, height: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="codAmount">COD Amount (₹)</Label>
                  <Input
                    id="codAmount"
                    type="number"
                    value={packageDetails.codAmount}
                    onChange={(e) => setPackageDetails({ ...packageDetails, codAmount: parseInt(e.target.value) })}
                    placeholder="0 for prepaid"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fragile"
                    checked={packageDetails.fragile}
                    onCheckedChange={(checked) => setPackageDetails({ ...packageDetails, fragile: checked === true })}
                  />
                  <Label htmlFor="fragile" className="text-sm">Fragile item</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insurance"
                    checked={packageDetails.insurance}
                    onCheckedChange={(checked) => setPackageDetails({ ...packageDetails, insurance: checked === true })}
                  />
                  <Label htmlFor="insurance" className="text-sm">Add insurance (+₹{Math.floor(orderValue * 0.01)})</Label>
                </div>
              </div>
            </div>

            <Button
              onClick={createShipment}
              disabled={!selectedCarrier || isCreatingShipment}
              className="w-full mt-4"
            >
              {isCreatingShipment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Shipment...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Create Shipment
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Existing Tracking */}
      {existingTrackingId && existingCarrier && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Tracking Information
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => trackPackage(existingCarrier, existingTrackingId)}
                disabled={isTracking}
              >
                {isTracking ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Tracking Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tracking ID</Label>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{existingTrackingId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(existingTrackingId)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Carrier</Label>
                  <p>{carriers.find(c => c.id === existingCarrier)?.name}</p>
                </div>
              </div>

              {trackingInfo && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Current Status</Label>
                      <Badge className={getStatusBadgeColor(trackingInfo.status)}>
                        {trackingInfo.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <Label>Current Location</Label>
                      <p className="text-sm">{trackingInfo.currentLocation}</p>
                    </div>
                    <div>
                      <Label>Expected Delivery</Label>
                      <p className="text-sm">
                        {trackingInfo.estimatedDelivery 
                          ? format(new Date(trackingInfo.estimatedDelivery), 'MMM dd, yyyy')
                          : trackingInfo.actualDelivery
                          ? format(new Date(trackingInfo.actualDelivery), 'MMM dd, yyyy')
                          : 'TBD'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Tracking Events */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Tracking Timeline</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {trackingInfo.events.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3 text-sm">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center
                            ${event.status === 'delivered' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                            }
                          `}>
                            {event.status === 'delivered' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Package className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{event.description}</span>
                              <span className="text-gray-500">
                                {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                            <div className="text-gray-600 flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                            {event.remarks && (
                              <p className="text-gray-600 italic mt-1">"{event.remarks}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* External Tracking Link */}
                  <div className="border-t pt-4">
                    <Button variant="outline" asChild className="w-full">
                      <a 
                        href={`${carriers.find(c => c.id === existingCarrier)?.trackingUrl}${existingTrackingId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Track on {carriers.find(c => c.id === existingCarrier)?.name} Website
                      </a>
                    </Button>
                  </div>
                </>
              )}

              {/* Manual Tracking Update */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Add Manual Update</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Select 
                    value={newTrackingEvent.status} 
                    onValueChange={(value) => setNewTrackingEvent({ ...newTrackingEvent, status: value as ShippingStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="delivery_failed">Delivery Failed</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Location"
                    value={newTrackingEvent.location}
                    onChange={(e) => setNewTrackingEvent({ ...newTrackingEvent, location: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Description"
                  value={newTrackingEvent.description}
                  onChange={(e) => setNewTrackingEvent({ ...newTrackingEvent, description: e.target.value })}
                  className="mt-2"
                />
                <Input
                  placeholder="Courier remarks (optional)"
                  value={newTrackingEvent.remarks}
                  onChange={(e) => setNewTrackingEvent({ ...newTrackingEvent, remarks: e.target.value })}
                  className="mt-2"
                />
                <Button onClick={addTrackingEvent} className="w-full mt-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carrier Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Carrier Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {carriers.slice(0, 4).map((carrier) => (
              <div key={carrier.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-semibold">{carrier.name}</p>
                    <p className="text-sm text-gray-600">
                      {carrier.avgDeliveryDays} days • Max {carrier.maxWeight}kg
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{carrier.pricing.baseRate + Math.ceil(packageWeight) * carrier.pricing.perKgRate}</p>
                  {carrier.supportedFeatures.cashOnDelivery && (
                    <p className="text-xs text-gray-500">COD available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}