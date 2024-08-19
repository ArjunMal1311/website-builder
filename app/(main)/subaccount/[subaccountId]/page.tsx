import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table'
import { AreaChart, BadgeDelta } from '@tremor/react'
import { ClipboardIcon, Contact2, DollarSign, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { db } from '../../../../lib/db'
import BlurPage from '../../../../components/global/blur-page'

type Props = {
    params: { subaccountId: string }
    searchParams: {
        code: string
    }
}

const SubaccountPageId = async ({ params, searchParams }: Props) => {
    let currency = 'USD'
    let sessions
    let totalClosedSessions
    let totalPendingSessions
    let net = 0
    let potentialIncome = 0
    let closingRate = 0

    const subaccountDetails = await db.subAccount.findUnique({
        where: {
            id: params.subaccountId,
        },
    })

    const currentYear = new Date().getFullYear()
    const startDate = new Date(`${currentYear}-01-01T00:00:00Z`).getTime() / 1000
    const endDate = new Date(`${currentYear}-12-31T23:59:59Z`).getTime() / 1000



    return (
        <BlurPage>
            <div className="relative h-full">
                <div className="flex flex-col gap-4 pb-6">
                    <div className="flex gap-4 flex-col xl:!flex-row">
                        <Card className="flex-1 relative">
                            <CardHeader>
                                <CardDescription>Income</CardDescription>
                                <CardTitle className="text-4xl">
                                    {net ? `${currency} ${net.toFixed(2)}` : `$0.00`}
                                </CardTitle>
                                <small className="text-xs text-muted-foreground">
                                    For the year {currentYear}
                                </small>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Total revenue generated as reflected in your stripe dashboard.
                            </CardContent>
                            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
                        </Card>
                        <Card className="flex-1 relative">
                            <CardHeader>
                                <CardDescription>Potential Income</CardDescription>
                                <CardTitle className="text-4xl">
                                    {potentialIncome
                                        ? `${currency} ${potentialIncome.toFixed(2)}`
                                        : `$0.00`}
                                </CardTitle>
                                <small className="text-xs text-muted-foreground">
                                    For the year {currentYear}
                                </small>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                This is how much you can close.
                            </CardContent>
                            <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
                        </Card>

                    </div>

                    <div className="flex gap-4 flex-col xl:!flex-row">
                        <Card className="relative">
                            <CardHeader>
                                <CardDescription>Funnel Performance</CardDescription>
                            </CardHeader>
                            <CardContent className=" text-sm text-muted-foreground flex flex-col gap-12 justify-between ">
                                <div className="lg:w-[150px]">
                                    Total page visits across all funnels. Hover over to get more
                                    details on funnel page performance.
                                </div>
                            </CardContent>
                            <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
                        </Card>
                        <Card className="p-4 flex-1">
                            <CardHeader>
                                <CardTitle>Checkout Activity</CardTitle>
                            </CardHeader>
                            <AreaChart
                                className="text-sm stroke-primary"
                                data={sessions || []}
                                index="created"
                                categories={['amount_total']}
                                colors={['primary']}
                                yAxisWidth={30}
                                showAnimation={true}
                            />
                        </Card>
                    </div>
                    <div className="flex gap-4 xl:!flex-row flex-col">
                        <Card className="p-4 flex-1 h-[450px] overflow-scroll relative">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Transition History
                                    <BadgeDelta
                                        className="rounded-xl bg-transparent"
                                        deltaType="moderateIncrease"
                                        isIncreasePositive={true}
                                        size="xs"
                                    >
                                        +12.3%
                                    </BadgeDelta>
                                </CardTitle>
                                <Table>
                                    <TableHeader className="!sticky !top-0">
                                        <TableRow>
                                            <TableHead className="w-[300px]">Email</TableHead>
                                            <TableHead className="w-[200px]">Status</TableHead>
                                            <TableHead>Created Date</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </div>
        </BlurPage>
    )
}

export default SubaccountPageId