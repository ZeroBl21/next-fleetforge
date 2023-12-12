"use client"

import dynamic from 'next/dynamic'

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Skeleton } from "@/components/ui/skeleton"
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
import { DataTable } from '../dashboard/data-table'
import { Payment, columns } from '../dashboard/columns'

const BODY = { coordinates: [[-70.698372, 18.479001], [-69.836459, 19.453335]] }
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

  return response.json()
}

const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  // ...
]

const Map = dynamic(
  () => import('@/components/map'), // replace '@components/map' with your component's location
  {
    ssr: false,
  } // This line is important. It's what prevents server-side render
)

const Page = () => {
  const formSchema = z.object({
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <div>
      <section className='flex gap-2'>
        <div className='w-1/2'>
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso a llevar (LB)</FormLabel>
                    <FormControl>
                      <Input placeholder="500lb..." {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex gap-1'>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origen</FormLabel>
                      <FormControl>
                        <Input placeholder="Santiago" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destino</FormLabel>
                      <FormControl>
                        <Input placeholder="Santo Domingo" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
        <Map/>
      </section>

      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Page;
