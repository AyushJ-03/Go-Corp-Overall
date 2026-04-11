import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import { ArrowLeft, MapPin, Navigation } from 'lucide-react'
import Button from '../components/Button'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { deductFare } from '../services/walletAPI'

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Custom icon for office
const officeIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full text-xs font-bold border-2 border-white shadow-md">
      🏢
    </div>
  `,
  iconSize: [40, 40],
  className: 'custom-div-icon'
})

// Custom icons for stops
const createStopIcon = (index, isActive) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 ${isActive ? 'bg-primary' : 'bg-gray-400'} text-white rounded-full text-xs font-bold border-2 border-white shadow-md transition-all">
        ${index}
      </div>
    `,
    iconSize: isActive ? [32, 32] : [28, 28],
    className: 'custom-div-icon'
  })
}

const MapContent = ({ routePath, batchData, officeLocation }) => {
  const map = useMap()
  
  useEffect(() => {
    if (routePath && routePath.length > 0) {
      const allPoints = [...routePath]
      if (officeLocation) {
        allPoints.push(officeLocation)
      }
      const bounds = L.latLngBounds(allPoints)
      map.fitBounds(bounds, { padding: [100, 100] })
    }
  }, [routePath, officeLocation, map])

  return (
    <>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {routePath && <Polyline pathOptions={{ color: '#f29400', weight: 4, opacity: 0.8 }} positions={routePath} />}
      
      {batchData?.rides.map((ride, idx) => (
        <Marker 
          key={`ride-${idx}`}
          position={[ride.pickupLocation.coordinates[1], ride.pickupLocation.coordinates[0]]}
          icon={createStopIcon(ride.pickupOrder || idx + 1, idx === batchData.currentRideIndex)}
        >
          <Popup>{ride.employeeName}</Popup>
        </Marker>
      ))}

      {batchData?.officeLocation && (
        <Marker position={batchData.officeLocation} icon={officeIcon}>
          <Popup>Office Destination</Popup>
        </Marker>
      )}
    </>
  )
}

// Helper function to extract employee name - ALWAYS returns a string
const getEmployeeName = (employee) => {
  try {
    if (!employee) return 'Employee'
    if (typeof employee === 'string') return 'Employee'
    if (typeof employee === 'object') {
      if (employee.name && typeof employee.name === 'string') {
        return employee.name.trim() || 'Employee'
      }
      const firstName = employee.first_name ? String(employee.first_name).trim() : ''
      const lastName = employee.last_name ? String(employee.last_name).trim() : ''
      const fullName = `${firstName} ${lastName}`.trim()
      if (fullName) return fullName
    }
  } catch (err) {
    console.error('Error in getEmployeeName:', err, employee)
  }
  return 'Employee'
}

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Orange Marker
const orangeIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #f29400; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 15px rgba(242,148,0,0.5);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const DestinationPage = () => {
  const navigate = useNavigate()
  const [rideData, setRideData] = useState(null)
  const [batchData, setBatchData] = useState(null)
  const [currentRideIndex, setCurrentRideIndex] = useState(0)
  const [routePath, setRoutePath] = useState(null)

  useEffect(() => {
    const acceptedRide = localStorage.getItem('acceptedRide')
    const acceptedBatch = localStorage.getItem('acceptedBatch')
    
    if (acceptedBatch) {
      const batch = JSON.parse(acceptedBatch)
      setBatchData(batch)
      console.log('DestinationPage - Loaded batch data:', batch);
      console.log('DestinationPage - estimatedFare:', batch.estimatedFare);
      const savedIndex = sessionStorage.getItem('currentRideIndex')
      setCurrentRideIndex(savedIndex ? parseInt(savedIndex) : 0)
    } else if (acceptedRide) {
      setRideData(JSON.parse(acceptedRide))
    }
  }, [])

  const currentRide = batchData?.rides?.[currentRideIndex] || rideData

  // Extract route path if available from batch
  const routePathFromBatch = React.useMemo(() => {
    if (!batchData?.routePolyline?.coordinates && !batchData?.pickupPolyline?.coordinates) return null
    const poly = batchData.routePolyline || batchData.pickupPolyline;
    return poly.coordinates.map(([lng, lat]) => [lat, lng])
  }, [batchData])

  useEffect(() => {
    if (routePathFromBatch && routePathFromBatch.length > 0) {
      setRoutePath(routePathFromBatch)
    } else if (currentRide?.pickupLocation?.coordinates && currentRide?.dropLocation?.coordinates) {
      // Create a route between pickup and drop for single ride
      const pickupCoords = [currentRide.pickupLocation.coordinates[1], currentRide.pickupLocation.coordinates[0]]
      const dropCoords = [currentRide.dropLocation.coordinates[1], currentRide.dropLocation.coordinates[0]]
      setRoutePath([pickupCoords, dropCoords])
    } else {
      // Mock fallback
      setRoutePath([[28.6280, 77.3649], [28.6350, 77.3700]]) 
    }
  }, [currentRide, routePathFromBatch])

  const handleCompleteRide = async () => {
    if (batchData && currentRideIndex < batchData.rides.length - 1) {
      // Move to next ride in batch
      const nextIndex = currentRideIndex + 1
      setCurrentRideIndex(nextIndex)
      sessionStorage.setItem('currentRideIndex', nextIndex.toString())
      navigate('/customer-location')
    } else {
      // Batch complete - Show payment success page
      try {
        const idToProcess = batchData?.batchId || currentRide?.rideId || currentRide?._id;
        // Office ID source depends on how it was stored
        const officeId = batchData?.office_id?._id || batchData?.officeId || currentRide?.officeId || currentRide?.office_id;
        const finalAmount = batchData?.estimatedFare || currentRide?.estimatedFare || currentRide?.fare || 50;
        
        if (officeId && idToProcess) {
          console.log(`💰 Deducting wallet amount for office ${officeId}: ₹${finalAmount}`);
          try {
            await deductFare(officeId, finalAmount, idToProcess);
          } catch (apiError) {
            console.error('Wallet API Error Details:', apiError);
            // Show alert for debugging if it's a specific 500/400 error
            if (apiError.message || typeof apiError === 'string') {
              alert(`Wallet Deduction Note: ${apiError.message || apiError}. The ride is completed, but balance update had an issue.`);
            }
          }
        }
      } catch (error) {
        console.error('Wallet deduction flow failed:', error);
      }
      
      navigate('/payment-success')
    }
  }

  return (
    <div className="relative h-screen flex flex-col bg-white animate-fade-in overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 z-[1] w-full h-full">
        <MapContainer 
          center={[28.6280, 77.3649]} 
          zoom={13} 
          scrollWheelZoom={true} 
          zoomControl={false}
          className="w-full h-full"
        >
          <MapContent 
            routePath={routePath}
            batchData={batchData ? { ...batchData, currentRideIndex } : null}
            officeLocation={batchData?.officeLocation}
          />
        </MapContainer>
      </div>

      {/* UI Overlay */}
      <div className="relative z-[10] flex flex-col h-full pointer-events-none">
        {/* Header */}
        <div className="flex items-center px-6 pt-12 pointer-events-auto">
          <button 
            className="w-12 h-12 bg-white rounded-full flex justify-center items-center shadow-lg border border-gray-100" 
            onClick={() => navigate('/otp-verification')}
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div className="flex-1 text-center pr-12">
            <h1 className="text-xl font-extrabold text-gray-800">Destination</h1>
          </div>
        </div>

        {/* Re-center button */}
        <div className="flex justify-end p-6 mt-auto mb-4 pointer-events-auto">
            <button className="w-12 h-12 bg-white rounded-full flex justify-center items-center shadow-lg border border-gray-100 text-primary">
                <Navigation size={24} className="fill-primary opacity-20" />
                <Navigation size={24} className="absolute" />
            </button>
        </div>

        {/* Bottom Area */}
        <div className="bg-transparent px-6 pb-10 pointer-events-auto">
          {/* Address Card */}
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-[0_15px_40px_rgba(0,0,0,0.08)] flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                <MapPin size={24} fill="currentColor" className="opacity-20" />
                <MapPin size={24} className="absolute" />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-500 mb-1">
                    {String(currentRide?.employeeName || getEmployeeName(currentRide?.employee_id))} - Drop Off
                </p>
                <p className="text-lg font-extrabold text-gray-800 leading-tight">
                    {currentRide?.dropAddress || '1901 Thornridge Cir. Shiloh, Hawaii 81063'}
                </p>
                {batchData && (
                  <p className="text-xs font-bold text-primary mt-1">Stop {currentRideIndex + 1} of {batchData.rides.length}</p>
                )}
            </div>
          </div>

          <Button 
            className="text-lg shadow-[0_10px_20px_rgba(242,148,0,0.3)] w-full py-5" 
            onClick={handleCompleteRide}
          >
            {batchData ? (
              currentRideIndex < batchData.rides.length - 1 
                ? `₹${batchData.estimatedFare !== undefined ? batchData.estimatedFare : (currentRide?.fare || currentRide?.price || 'N/A')} - Next Passenger` 
                : `Fare ₹${batchData.estimatedFare !== undefined ? batchData.estimatedFare : (currentRide?.fare || currentRide?.price || 'N/A')}`
            ) : (
              `Fare ₹${currentRide?.fare || currentRide?.price || currentRide?.ridePrice || 'N/A'}`
            )}
          </Button>
        </div>

        {/* Home Indicator */}
        <div className="w-[140px] h-1.5 bg-gray-900 rounded-full mx-auto mb-2 opacity-90"></div>
      </div>
    </div>
  )
}

export default DestinationPage
