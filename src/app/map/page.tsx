import { Metadata } from 'next/types';
import dynamic from 'next/dynamic'

import { Skeleton } from "@/components/ui/skeleton"
import MapForm from "@/components/map-form"

import { DataTable } from './data-table'
import { Vehicle, columns } from './columns'
import { getRoute, getVehiclesWithFuelCost, getWeather } from './actions'

export const metadata: Metadata = {
  title: "Map",
  description: "Esta es la pantalla de gestion de flota principal",
}

async function Page({ searchParams }: any) {
  let route
  let data: Vehicle[] = []

  const Map = dynamic(
    () => import('@/components/map'),
    {
      loading: () => <Skeleton className="relative h-[60dvh] w-1/2" />,
      ssr: false,
    } // This line is important. It's what prevents server-side render
  )

  if (searchParams.org && searchParams.des) {
    route = await getRoute(searchParams).catch(e => e);

    if (route && searchParams.w && searchParams.vt && route?.summary) {
      const temp = await getWeather({ lat: route?.origin[0], lng: route.origin[1] })
      //@ts-ignore
      data = await getVehiclesWithFuelCost(
        {
          weight: searchParams.w,
          distance: route?.summary.distance,
          roadType: route.summary.road,
          vehicleType: searchParams.vt,
          fuelType: searchParams.ft,
          temperature: temp || 32,
          priority: searchParams.pr 
        }
      )
    }
  }

  return (
    <div>
      <section className='flex gap-2 flex-col sm:flex-row'>
        <div className='sm:w-1/2'>
          <MapForm />
        </div>
        <Map route={route} />
      </section>

      <div className="mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Page;
