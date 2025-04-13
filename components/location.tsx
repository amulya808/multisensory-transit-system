"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const description = ""

export function Location() {
  return (
    <div className="flex justify-center gap-4 px-4 lg:px-6">
      <Card className="w-full max-w-320 h-100 @container/card">
        <CardHeader>
          <CardTitle>Map</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        </CardContent>
      </Card>
    </div>
  )
}
