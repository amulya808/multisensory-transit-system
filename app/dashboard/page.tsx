import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SensorCards } from "@/components/sensor-cards"
import { Location } from "@/components/sensor-cards/location"
import { TrafficSignCard } from "@/components/sensor-cards/traffic-signs";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SensorCards/>
              <div className="px-4 lg:px-6">
              </div>
              <Location />
            </div>
            <TrafficSignCard />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
