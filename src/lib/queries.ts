"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server"

import { db } from "./db"
import { redirect } from "next/navigation"
import { Agency, Plan, Role, SubAccount, User } from "@prisma/client"
import { v4 } from "uuid"

export const getAuthUserDetails = async () => {
    const user = await currentUser()
    if (!user) {
        return
    }

    const userData = await db.user.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
        include: {
            agency: {
                include: {
                    sidebarOption: true,
                    subAccount: {
                        include: {
                            sidebarOption: true,
                        },
                    },
                },
            },
            permissions: true,
        },
    })

    return userData
}

export const saveActivityLogsNotification = async ({
    agencyId,
    description,
    subaccountId,
}: {
    agencyId?: string
    description: string
    subaccountId?: string
}) => {
    const authUser = await currentUser()
    let userData
    if (!authUser) {
        const response = await db.user.findFirst({
            where: {
                agency: {
                    subAccount: {
                        some: { id: subaccountId },
                    },
                },
            },
        })
        if (response) {
            userData = response
        }
    } else {
        userData = await db.user.findUnique({
            where: { email: authUser?.emailAddresses[0].emailAddress },
        })
    }

    if (!userData) {
        console.log('Could not find a user')
        return
    }

    let foundAgencyId = agencyId
    if (!foundAgencyId) {
        if (!subaccountId) {
            throw new Error(
                'You need to provide atleast an agency Id or subaccount Id'
            )
        }
        const response = await db.subAccount.findUnique({
            where: { id: subaccountId },
        })
        if (response) foundAgencyId = response.agencyId
    }
    if (subaccountId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                user: {
                    connect: {
                        id: userData.id,
                    },
                },
                agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
                subAccount: {
                    connect: { id: subaccountId },
                },
            },
        })
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                user: {
                    connect: {
                        id: userData.id,
                    },
                },
                agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
            },
        })
    }
}

export const createTeamUser = async (agencyId: string, user: User) => {
    if (user.role === 'AGENCY_OWNER') return null
    const response = await db.user.create({ data: { ...user } })
    return response
}

export const verifyAndAcceptInvitation = async () => {
    const user = await currentUser()
    if (!user) return redirect('/sign-in')
    const invitationExists = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
            status: 'PENDING',
        },
    })

    if (invitationExists) {
        const userDetails = await createTeamUser(invitationExists.agencyId, {
            email: invitationExists.email,
            agencyId: invitationExists.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: invitationExists.role,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        await saveActivityLogsNotification({
            agencyId: invitationExists?.agencyId,
            description: `Joined`,
            subaccountId: undefined,
        })

        if (userDetails) {
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    role: userDetails.role || 'SUBACCOUNT_USER',
                },
            })

            await db.invitation.delete({
                where: { email: userDetails.email },
            })

            return userDetails.agencyId
        } else return null
    } else {
        const agency = await db.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress,
            },
        })
        return agency ? agency.agencyId : null
    }
}

export const deleteAgency = async (agencyId: string) => {
    const response = await db.agency.delete({ where: { id: agencyId } })
    return response
}

export const initUser = async (newUser: Partial<User>) => {
    const user = await currentUser()
    if (!user) return

    await db.user.upsert({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
        update: newUser,
        create: {
            id: user.id,
            avatarUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: newUser.role || 'SUBACCOUNT_USER',
        },
    })

    await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
            role: newUser.role || 'SUBACCOUNT_USER',
        },
    })
}

export const updateAgencyDetails = async (
    agencyId: string,
    agencyDetails: Partial<Agency>
) => {
    const response = await db.agency.update({
        where: { id: agencyId },
        data: { ...agencyDetails },
    })
    return response
}

export const upsertAgency = async ({ id, ...agency }: Agency, price?: Plan) => {
    console.log(agency)
    if (!agency.companyEmail) return null
    try {
        const agencyDetails = await db.agency.upsert({
            where: {
                id: id,
            },
            update: agency,
            create: {
                users: {
                    connect: { email: agency.companyEmail },
                },
                ...agency,
                sidebarOption: {
                    create: [
                        {
                            name: 'Dashboard',
                            icon: 'category',
                            link: `/agency/${id}`,
                        },
                        {
                            name: 'Launchpad',
                            icon: 'clipboardIcon',
                            link: `/agency/${id}/launchpad`,
                        },
                        {
                            name: 'Billing',
                            icon: 'payment',
                            link: `/agency/${id}/billing`,
                        },
                        {
                            name: 'Settings',
                            icon: 'settings',
                            link: `/agency/${id}/settings`,
                        },
                        {
                            name: 'Sub Accounts',
                            icon: 'person',
                            link: `/agency/${id}/all-subaccounts`,
                        },
                        {
                            name: 'Team',
                            icon: 'shield',
                            link: `/agency/${id}/team`,
                        },
                    ],
                },
            },
        })
        return agencyDetails
    } catch (error) {
        console.log(error)
    }
}

export const getNotificationAndUser = async (agencyId: string) => {
    try {
        const response = await db.notification.findMany({
            where: { agencyId },
            include: { user: true },
            orderBy: {
                createdAt: 'desc',
            },
        })
        return response
    } catch (error) {
        console.log(error)
    }
}

export const upsertSubAccount = async ({ id, ...subAccount }: SubAccount) => {
    if (!subAccount.companyEmail) return null

    const agencyOwner = await db.user.findFirst({
        where: {
            agency: {
                id: subAccount.agencyId,
            },
            role: 'AGENCY_OWNER',
        },
    })

    if (!agencyOwner) return console.log('🔴Erorr could not create subaccount')

    const permissionId = v4()

    const response = await db.subAccount.upsert({
        where: { id: id },
        update: subAccount,
        create: {
            ...subAccount,
            id: id || v4(),
            permissions: {
                create: {
                    access: true,
                    email: agencyOwner.email,
                    id: permissionId,
                }
            },
            pipelines: {
                create: { name: 'Lead Cycle' },
            },
            sidebarOption: {
                create: [
                    {
                        name: 'Launchpad',
                        icon: 'clipboardIcon',
                        link: `/subaccount/${id}/launchpad`,
                    },
                    {
                        name: 'Settings',
                        icon: 'settings',
                        link: `/subaccount/${id}/settings`,
                    },
                    {
                        name: 'Funnels',
                        icon: 'pipelines',
                        link: `/subaccount/${id}/funnels`,
                    },
                    {
                        name: 'Media',
                        icon: 'database',
                        link: `/subaccount/${id}/media`,
                    },
                    {
                        name: 'Automations',
                        icon: 'chip',
                        link: `/subaccount/${id}/automations`,
                    },
                    {
                        name: 'Pipelines',
                        icon: 'flag',
                        link: `/subaccount/${id}/pipelines`,
                    },
                    {
                        name: 'Contacts',
                        icon: 'person',
                        link: `/subaccount/${id}/contacts`,
                    },
                    {
                        name: 'Dashboard',
                        icon: 'category',
                        link: `/subaccount/${id}`,
                    },
                ],
            },
        },
    })
    return response
}

export const getUserPermissions = async (userId: string) => {
    const response = await db.user.findUnique({
        where: { id: userId },
        select: { permissions: { include: { subAccount: true } } },
    })

    return response
}

export const updateUser = async (user: Partial<User>) => {
    const response = await db.user.update({
        where: { email: user.email },
        data: { ...user },
    })

    await clerkClient.users.updateUserMetadata(response.id, {
        privateMetadata: {
            role: user.role || 'SUBACCOUNT_USER',
        },
    })

    return response
}

export const changeUserPermissions = async (
    permissionId: string | undefined,
    userEmail: string,
    subAccountId: string,
    permission: boolean
) => {
    try {
        const response = await db.permissions.upsert({
            where: { id: permissionId },
            update: { access: permission },
            create: {
                access: permission,
                email: userEmail,
                subAccountId: subAccountId,
            },
        })
        return response
    } catch (error) {
        console.log('🔴Could not change persmission', error)
    }
}

export const getSubaccountDetails = async (subaccountId: string) => {
    const response = await db.subAccount.findUnique({
        where: {
            id: subaccountId,
        },
    })
    return response
}

export const deleteSubAccount = async (subaccountId: string) => {
    const response = await db.subAccount.delete({
        where: {
            id: subaccountId,
        },
    })
    return response
}

export const deleteUser = async (userId: string) => {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
            role: undefined,
        },
    })
    const deletedUser = await db.user.delete({ where: { id: userId } })

    return deletedUser
}

export const getUser = async (id: string) => {
    const user = await db.user.findUnique({
        where: {
            id,
        },
    })

    return user
}

export const sendInvitation = async (
    role: Role,
    email: string,
    agencyId: string
) => {
    const resposne = await db.invitation.create({
        data: { email, agencyId, role },
    })

    try {
        const invitation = await clerkClient.invitations.createInvitation({
            emailAddress: email,
            redirectUrl: process.env.NEXT_PUBLIC_URL,
            publicMetadata: {
                throughInvitation: true,
                role,
            },
        })
    } catch (error) {
        console.log(error)
        throw error
    }

    return resposne
}
