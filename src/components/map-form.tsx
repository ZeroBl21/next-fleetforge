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

const formSchema = z.object({
  weight: z.coerce.number().min(0, {
    message: "Peso debe ser un numero positivo"
  }),
  origin: z.string().refine(data => {
    const regex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    return regex.test(data);
  }, {
    message: "Origin must be two comma-separated floats with an optional space."
  }),
  destiny: z.string().refine(data => {
    const regex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    return regex.test(data);
  }, {
    message: "Destiny must be two comma-separated floats with an optional space."
  }),
  vehicle_type: z.enum(["", "gas", "gasoline", "electric"]),
  preference: z.enum(["", "recommended", "fastest", "shortest"]),
  avoid: z.enum(["", "city", "highways"])
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
      vehicle_type: searchParams?.get('vt') || ''
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    router.push('/map?' +
      //@ts-ignore
      new URLSearchParams({
        org: values.origin,
        des: values.destiny,
        pref: values.preference,
        w: values.weight,
        avo: values.avoid,
        vt: values.vehicle_type
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
              <Select name={field.name}
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
              <Select name={field.name}
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
                  <Input placeholder="Santiago" {...field} defaultValue={searchParams?.get('org') || ''} />
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
                  <Input placeholder="Santo Domingo" {...field} defaultValue={searchParams?.get('des') || ''} />
                </FormControl>
                <FormDescription>
                  El Punto destino del viaje
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="vehicle_type"
          render={({ field }) => (
            <Select
              name={field.name}
              onValueChange={(value) => field.onChange({ target: { name: field.name, value } })}
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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
