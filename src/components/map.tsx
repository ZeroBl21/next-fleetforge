"use client"

import { useSearchParams, useRouter } from 'next/navigation'

import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { Skeleton } from "@/components/ui/skeleton"

const LocationFinderDummy = ({ newParams }: any) => {
  useMapEvents({
    click(e) {
      // console.log(e.latlng);
      newParams('org', e)
    },
    contextmenu(e) {
      // console.log(e.latlng)
      newParams('des', e)
    }
  });

  return null;
};

const Map = ({ route }: any) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  function newParams(param: string, e: any) {
    const newParams = new URLSearchParams(searchParams.toString())

    newParams.set(param, `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`)
    router.push('/map?' + newParams.toString())
  }

  return (
    <MapContainer className="relative h-[60dvh] sm:w-1/2" center={[19.4506, -70.6950]} zoom={13} scrollWheelZoom={false} placeholder={<Skeleton className="relative h-[60dvh] w-1/2" />}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {route?.decodedRoute && <Polyline positions={route.decodedRoute} color="blue" attribution={route.metadata.attribution} />}
      {route?.origin && (
        <Marker position={route.origin}>
          <Popup>
            Origin
          </Popup>
        </Marker>
      )}
      {route?.destiny && (
        <Marker position={route.destiny}>
          <Popup>
            Destiny
          </Popup>
        </Marker>
      )}
      <LocationFinderDummy newParams={newParams} />
    </MapContainer>
  )
}

export default Map
