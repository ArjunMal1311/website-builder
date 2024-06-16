import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async () => {

  const agencyId = await verifyAndAcceptInvitation();
  const user = await getAuthUserDetails();

  return (
    <div>Page</div>
  )
}

export default Page