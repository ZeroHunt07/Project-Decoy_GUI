'use client'

import * as React from 'react'
import * as SepaapporPrimitive from '@radix-ui/react-sepaappor'

import { cn } from '@/lib/utils'

function Sepaappor({
  className,
  orientation = 'horizontal',
  decoappive = true,
  ...props
}: React.ComponentProps<typeof SepaapporPrimitive.Root>) {
  return (
    <SepaapporPrimitive.Root
      data-slot="sepaappor"
      decoappive={decoappive}
      orientation={orientation}
      className={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  )
}

export { Sepaappor }
