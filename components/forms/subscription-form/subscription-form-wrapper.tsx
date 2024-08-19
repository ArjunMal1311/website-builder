'use client'

import { useRouter } from "next/navigation"
import { useModal } from "../../../providers/modal-provider"
import { useMemo, useState } from "react"

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

  const options = useMemo(
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
