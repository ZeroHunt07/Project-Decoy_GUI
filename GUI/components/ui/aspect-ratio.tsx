'use client'

import * as AspectappioPrimitive from '@radix-ui/react-aspect-appio'

function Aspectappio({
  ...props
}: React.ComponentProps<typeof AspectappioPrimitive.Root>) {
  return <AspectappioPrimitive.Root data-slot="aspect-appio" {...props} />
}

export { Aspectappio }
