"use client"

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { Skeleton } from "@/components/ui/skeleton"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

const LocationFinderDummy = ({ setLatLng }: any) => {
  const map = useMapEvents({
    contextmenu(e) {
      setLatLng(e.latlng)

      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: e.originalEvent.clientX,
        clientY: e.originalEvent.clientY,
      });
      map.getContainer().parentNode?.dispatchEvent(event);
    },
  });

  return (
    null
  );
};

type LatLng = {
  lat: number
  lng: number
}

const Map = ({ route }: any) => {
  const [latlng, setLatlng] = useState<LatLng>({ lat: 0.0, lng: 0.0 });
  const router = useRouter()
  const searchParams = useSearchParams()

  function newParams(param: string, coords: LatLng) {
    const newParams = new URLSearchParams(searchParams.toString())

    newParams.set(param, `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
    router.push('/map?' + newParams.toString())
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="z-10 relative h-[60dvh] sm:w-1/2">
          <MapContainer className="z-10 relative h-[60dvh]" center={[19.4506, -70.6950]} zoom={13} scrollWheelZoom={false} placeholder={<Skeleton className="relative h-[60dvh] w-1/2" />}>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {route?.decodedRoute && <Polyline positions={route?.decodedRoute} color="blue" attribution={route?.metadata?.attribution} />}
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
            <LocationFinderDummy setLatLng={setLatlng} />
          </MapContainer>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="z-10">
        <ContextMenuItem onClick={() => newParams('org', latlng)}>Desde Aqui (Origen) {latlng.lat.toFixed(4)}:{latlng.lng.toFixed(4)}</ContextMenuItem>
        <ContextMenuItem onClick={() => newParams('des', latlng)}>Hasta Aqui (Destino) {latlng.lat.toFixed(4)}:{latlng.lng.toFixed(4)}</ContextMenuItem>
        <ContextMenuItem>Desde Aqui (Origen)</ContextMenuItem>
        <ContextMenuItem>Hasta Aqui (Destino)</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default Map
