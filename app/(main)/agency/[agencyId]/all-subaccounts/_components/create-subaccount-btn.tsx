'use client'

import { Agency, AgencySidebarOption, SubAccount, User } from '@prisma/client'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Button } from '../../../../../../components/ui/button'
import { useModal } from '../../../../../../providers/modal-provider'
import CustomModal from '../../../../../../components/global/custom-modal'
import SubAccountDetails from '../../../../../../components/forms/subaccount-details'

type Props = {
  user: User & {
    agency:
      | (
          | Agency
          | (null & {
              SubAccount: SubAccount[]
              SideBarOption: AgencySidebarOption[]
            })
        )
      | null
  }
  id: string
  className: string
}

const CreateSubaccountButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal()
  const agencyDetails = user.agency

  if (!agencyDetails) return

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subheading="You can switch bettween"
          >
            <SubAccountDetails
              agencyDetails={agencyDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        )
      }}
    >
      <PlusCircleIcon size={15} />
      Create Sub Account
    </Button>
  )
}

export default CreateSubaccountButton
