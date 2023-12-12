import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { useEffect } from 'react'

const BODY = { coordinates: [[-68.712, 18.613], [-70.695, 19.451]] }
// const BODY = { coordinates: [[18.4936, -69.8384], [19.4498, -70.6966]] }
const URL = "https://api.openrouteservice.org/v2/directions/driving-car"

async function test() {
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      'Authorization': '5b3ce3597851110001cf6248401c42f5e54c4d6fa2a4bb3c6c71c310'
    },
    body: JSON.stringify(BODY)
  })

  const json = await response.json()
  console.log(json)
}

const Map = () => {
  useEffect(() => {
    test()
  }, [])

  return (
    <MapContainer center={[19.4506, -70.6950]} zoom={13} scrollWheelZoom={false} style={{ height: "60vh", width: "50%" }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[19.4506, -70.6950]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  )
}

export default Map
