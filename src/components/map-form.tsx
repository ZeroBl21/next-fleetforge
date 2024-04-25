"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const formSchema = z.object({
  weight: z.coerce.number().min(0, {
    message: "Peso debe ser un numero positivo"
  }),
  origin: z.string().refine(data => {
    const regex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    return regex.test(data);
  }, {
    message: "Origen debe ser dos números decimales separados por comas, con un espacio opcional."
  }),
  destiny: z.string().refine(data => {
    const regex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    return regex.test(data);
  }, {
    message: "Destino debe ser dos números decimales separados por comas, con un espacio opcional."
  }),
  vehicle_type: z.enum(["gas", "gasoline", "electric", "all"]),
  vehicle_fuel: z.any(),
  preference: z.enum(["recommended", "fastest", "shortest"]),
  priority: z.enum(["security", "economy", "efficiency"]),
  avoid: z.enum(["city", "highways"])
})

export default function MapForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: Number(searchParams?.get('w')) || 0,
      origin: searchParams?.get('org') || '',
      destiny: searchParams?.get('des') || '',
      //@ts-ignore
      preference: searchParams?.get('pref') || '',
      //@ts-ignore
      avoid: searchParams?.get('avo') || '',
      //@ts-ignore
      vehicle_type: searchParams?.get('vt') || '',
      vehicle_fuel: searchParams?.get('ft') || '',
      //@ts-ignore
      priority: searchParams?.get('pr') || ''
    },
  })

  useEffect(() => {
    form.setValue('origin', searchParams?.get('org') || '')
    form.setValue('destiny', searchParams?.get('des') || '')
  }, [form, searchParams])


  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push('/map?' +
      //@ts-ignore
      new URLSearchParams({
        org: searchParams?.get('org') || '',
        des: searchParams?.get('des') || '',
        pref: values.preference,
        w: values.weight,
        avo: values.avoid,
        vt: values.vehicle_type,
        ft: values.vehicle_fuel,
        pr: values.priority
      }).toString()
    )
  }

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4">

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso a llevar (LB)</FormLabel>
              <FormControl>
                <Input placeholder="500" {...field} type='number' />
              </FormControl>
              <FormDescription>
                El peso en libras
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex gap-1'>
          <FormField
            control={form.control}
            name="preference"
            render={({ field }) => (
              <Select
                name={field.name}
                value={field.value ? field.value : ''}
                onValueChange={(value) => field.onChange({ target: { name: field.name, value } })}
                required
              >
                <SelectTrigger ref={field.ref}>
                  <SelectValue placeholder="Tipo de Ruta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recomendada</SelectItem>
                  <SelectItem value="fastest">Rápida</SelectItem>
                  <SelectItem value="shortest">Corta</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          <FormField
            control={form.control}
            name="avoid"
            render={({ field }) => (
              <Select
                name={field.name}
                value={field.value ? field.value : ''}
                onValueChange={(value) => field.onChange({ target: { name: field.name, value } })}
                required
              >
                <SelectTrigger ref={field.ref}>
                  <SelectValue placeholder="Preferencia de Ruta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highways">Carretera</SelectItem>
                  <SelectItem value="city">Ciudad</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className='flex gap-1 [&>*]:flex-1'>
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origen</FormLabel>
                <FormControl>
                  <Input placeholder="Santiago" {...field} />
                </FormControl>
                <FormDescription>
                  El Punto de origen del viaje
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destiny"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino</FormLabel>
                <FormControl>
                  <Input placeholder="Santo Domingo" {...field} />
                </FormControl>
                <FormDescription>
                  El Punto destino del viaje
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FuelSelect form={form} vt={searchParams?.get('vt') || null} />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <Select
              name={field.name}
              value={field.value ? field.value : ''}
              onValueChange={(value) => field.onChange({ target: { name: field.name, value } })}
              required
            >
              <SelectTrigger ref={field.ref}>
                <SelectValue placeholder="Prioridad de viaje" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="security">Seguridad</SelectItem>
                <SelectItem value="economy">Economia</SelectItem>
                <SelectItem value="efficiency">Eficiencia</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

function FuelSelect({ form, vt = null }: any) {
  const fuelOptionsMap: { [key: string]: string[] } = {
    all: ["Gasolina Premium", "Gasolina Regular", "Gasoil Optimo", "Gasoil Regular", "Kerosene", "Gas Licuado (GLP)", "Gas Natural (GNV)", "Electricidad"],
    gasoline: ["Gasolina Premium", "Gasolina Regular", "Gasoil Optimo", "Gasoil Regular", "Kerosene"],
    gas: ["Gas Licuado (GLP)", "Gas Natural (GNV)"],
    electric: ["Electricidad"], // Opciones específicas para "Electrico"
  };

  const [selectedFuelType, setSelectedFuelType] = useState<string | null>(vt);

  return (
    <div className="flex gap-1">
      <FormField
        control={form.control}
        name="vehicle_type"
        render={({ field }) => (
          <Select
            name={field.name}
            value={field.value ? field.value : ''}
            onValueChange={(value) => {
              field.onChange({ target: { name: field.name, value } })
              setSelectedFuelType(value)
            }}
            required
          >
            <SelectTrigger ref={field.ref}>
              <SelectValue placeholder="Tipo de Vehiculo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="gasoline">Gasolina</SelectItem>
              <SelectItem value="gas">Gas</SelectItem>
              <SelectItem value="electric">Electrico</SelectItem>
            </SelectContent>
          </Select>
        )}
      />


      {selectedFuelType && (
        <FormField
          control={form.control}
          name="vehicle_fuel"
          render={({ field }) => (
            <Select
              name={field.name}
              value={field.value ? field.value : ''}
              onValueChange={(value) => field.onChange({ target: { name: field.name, value } })}
              required
            >
              <SelectTrigger ref={field.ref}>
                <SelectValue placeholder="Combustible" />
              </SelectTrigger>
              <SelectContent>
                {fuelOptionsMap[selectedFuelType].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}
    </div>
  );
}
