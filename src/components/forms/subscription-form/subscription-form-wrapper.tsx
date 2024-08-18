'use client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { pricingCards } from '@/lib/constants'
import { useModal } from '@/providers/modal-provider'
import { Plan } from '@prisma/client'
import { StripeElementsOptions } from '@stripe/stripe-js'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import Loading from '@/components/global/loading'
import SubscriptionForm from '.'

type Props = {
  customerId: string
  planExists: boolean
}

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal()
  const router = useRouter()

  const [subscription, setSubscription] = useState<{
    subscriptionId: string
    clientSecret: string
  }>({ subscriptionId: '', clientSecret: '' })

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret,
      appearance: {
        theme: 'flat',
      },
    }),
    [subscription]
  )


  return (
    <div className="border-none transition-all">
      Subscription Form thingy to be done here
    </div>
  )
}

export default SubscriptionFormWrapper
