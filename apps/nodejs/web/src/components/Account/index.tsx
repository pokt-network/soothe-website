'use client'

import type { Account } from '@/types'
import groupBy from 'lodash/groupBy'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AppBarHeight, PaddingBottomContent, PaddingTopContent } from '@/constants'
import CreateUpdateDialog from '@/components/Account/CreateUpdateDialog'
import { useFetchPricesQuery } from '@/features/cryptoPrice/slice'
import TransferDialog from '@/components/Transfer/TransferDialog'
import List, { AccountWithBalance, searchAccounts } from '@/components/Account/List'
import { BalanceByAddressType, IPendingBalanceByAddress } from '@/datasource/chains/base'
import { SupportedChains } from '@/constants/supportedChains'
import ViewDialog from '@/components/Account/ViewDialog'
import Header from '@/components/Account/Header'
import { useGetBalances } from '@/hooks/chains'
import { useAppSelector } from '@/hooks/redux'
import useDebounce from '@/hooks/useDebounce'
import { calculateHeight } from '@/utils'
import { getPendingBalanceOfAccountsByChain } from '@/utils/chains'

type AllAndSupportedChains = SupportedChains | 'all'
type NumberByStringMap = Record<string, number>

const minHeight = calculateHeight('100vh', AppBarHeight, PaddingTopContent, PaddingBottomContent, {
  xs: '(-10px)',
})

const Accounts = () => {
  const { accountsByChain: accountsMap, accounts } = useAppSelector((state) => state.account)
  const [selectedAccounts, setSelectedAccounts] = useState<AllAndSupportedChains>('all')

  const [accountToView, setAccountToView] = useState<Account>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<Account>(null)
  const [accountToTransfer, setAccountToTransfer] = useState<AccountWithBalance>(null)

  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebounce(searchText, 300)

  const { data: dataPrices, isLoading: isLoadingPrices } = useFetchPricesQuery()
  const { getBalances } = useGetBalances()
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [balanceByAddressMap, setBalanceByAddressMap] = useState<NumberByStringMap>({})
  const [isLoadingPendingBalances, setIsLoadingPendingBalances] = useState(false)
  const [pendingByAddressMap, setPendingByAddressMap] = useState<NumberByStringMap>({})

  const chainsWithAccounts = useMemo(() => {
    const chains: SupportedChains[] = []

    for (const chain in accountsMap) {
      if (accountsMap[chain]?.length) {
        chains.push(chain as SupportedChains)
      }
    }

    return chains
  }, [accountsMap])

  const getBalancesByAddressAndChain = useCallback(() => {
    if (!chainsWithAccounts.length) return

    setIsLoadingBalances(true)
    Promise.all<BalanceByAddressType[]>(
      chainsWithAccounts.map((chain) => {
        const addresses = accountsMap[chain].map((account) => account.address)
        return getBalances(addresses, chain)
      })
    )
      .then((balanceByAddressAndChain) => {
        const map: NumberByStringMap = {}

        for (const balanceByAddress of balanceByAddressAndChain) {
          for (const { address, balance } of balanceByAddress) {
            map[address] = balance
          }
        }

        setBalanceByAddressMap(map)
      })
      .finally(() => setIsLoadingBalances(false))
  }, [getBalances, chainsWithAccounts, accountsMap])

  const getPendingByAddressAndChain = useCallback(() => {
    if (!chainsWithAccounts.length) return

    setIsLoadingPendingBalances(true)
    Promise.all<IPendingBalanceByAddress[]>(
      chainsWithAccounts.map((chain) => {
        const addresses = accountsMap[chain].map((account) => account.address)
        return getPendingBalanceOfAccountsByChain(addresses, chain)
      })
    )
      .then((pendingByAddressAndChain) => {
        const map: NumberByStringMap = {}

        for (const pendingByAddress of pendingByAddressAndChain) {
          for (const { address, pending_balance } of pendingByAddress || []) {
            map[address] = pending_balance
          }
        }

        setPendingByAddressMap(map)
      })
      .finally(() => setIsLoadingPendingBalances(false))
  }, [chainsWithAccounts, accountsMap])

  useEffect(() => {
    getBalancesByAddressAndChain()
    const interval = setInterval(() => {
      if (isLoadingBalances) return

      getBalancesByAddressAndChain()
    }, 6e4)

    return () => clearInterval(interval)
    // eslint-disable-next-line
  }, [getBalancesByAddressAndChain])

  useEffect(() => {
    getPendingByAddressAndChain()
    const interval = setInterval(() => {
      if (isLoadingPendingBalances) return

      getPendingByAddressAndChain()
    }, 6e4)

    return () => clearInterval(interval)
    // eslint-disable-next-line
  }, [getPendingByAddressAndChain])

  const processedDataByChain: Partial<Record<SupportedChains, AccountWithBalance[]>> =
    useMemo(() => {
      let processedAccounts: AccountWithBalance[] = accounts.map((item) => {
        const balance = balanceByAddressMap[item.address] || 0
        const pendingBalance = pendingByAddressMap[item.address] || 0
        const cryptoPrice = dataPrices?.[item.chain]?.price || 0
        return {
          ...item,
          balance,
          pendingBalance,
          usdBalance: cryptoPrice * balance,
        }
      })

      if (debouncedSearchText) {
        processedAccounts = searchAccounts(
          debouncedSearchText,
          processedAccounts
        ) as AccountWithBalance[]
      }

      processedAccounts = processedAccounts.sort(
        (accountA, accountB) => accountB.balance - accountA.balance
      )

      return groupBy(processedAccounts, 'chain')
    }, [debouncedSearchText, balanceByAddressMap, pendingByAddressMap, accounts, dataPrices])

  const onSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }, [])

  const onClearSearch = useCallback(() => {
    setSearchText('')
  }, [])

  const onCloseViewDialog = useCallback(() => {
    setShowViewDialog(false)
    setTimeout(() => {
      setAccountToView(null)
    }, 150)
  }, [])

  const onOpenViewAccount = useCallback((account: Account) => {
    setShowViewDialog(true)
    setAccountToView(account)
  }, [])

  const onCloseEditAccount = useCallback(() => {
    setAccountToEdit(null)
  }, [])

  const onCloseTransferDialog = useCallback(() => {
    setAccountToTransfer(null)
  }, [])

  const onSelectedAccountToTransfer = useCallback((account: Account) => {
    setAccountToTransfer(account)
  }, [])

  const onSelectedAccountToEdit = useCallback((account: Account) => {
    setAccountToEdit(account)
  }, [])

  const onChangeSelectedAccounts = useCallback((newSelection: string) => {
    setSelectedAccounts(newSelection as AllAndSupportedChains)
  }, [])

  const contentList = useMemo(() => {
    if (!chainsWithAccounts.length) {
      return (
        <Stack>
          <Typography>{`You don't have any account yet.`}</Typography>
        </Stack>
      )
    }

    const chainsWithProcessedAccounts = Object.keys(processedDataByChain)
      .sort()
      .reverse() as SupportedChains[]

    if (
      debouncedSearchText &&
      ((selectedAccounts === 'all' && !chainsWithProcessedAccounts.length) ||
        (selectedAccounts !== 'all' && !chainsWithProcessedAccounts.includes(selectedAccounts)))
    ) {
      return (
        <Stack>
          <Typography>{`No Results.`}</Typography>
        </Stack>
      )
    }

    if (selectedAccounts === 'all') {
      return (
        <>
          {chainsWithProcessedAccounts.map((chain: SupportedChains, index) => (
            <List
              chain={chain}
              accounts={processedDataByChain[chain]}
              isLoadingPrices={isLoadingPrices}
              isLoadingBalance={isLoadingBalances}
              isLoadingPendingBalances={isLoadingPendingBalances}
              key={chain}
              onOpenViewAccount={onOpenViewAccount}
              onSelectedAccountToEdit={onSelectedAccountToEdit}
              onSelectedAccountToTransfer={onSelectedAccountToTransfer}
              isLast={index === chainsWithProcessedAccounts.length - 1}
            />
          ))}
        </>
      )
    }

    return (
      <List
        chain={selectedAccounts}
        accounts={processedDataByChain[selectedAccounts]}
        isLoadingPrices={isLoadingPrices}
        isLoadingBalance={isLoadingBalances}
        isLoadingPendingBalances={isLoadingPendingBalances}
        onOpenViewAccount={onOpenViewAccount}
        onSelectedAccountToEdit={onSelectedAccountToEdit}
        onSelectedAccountToTransfer={onSelectedAccountToTransfer}
        isLast={true}
      />
    )
  }, [
    selectedAccounts,
    chainsWithAccounts,
    onSelectedAccountToEdit,
    onOpenViewAccount,
    onSelectedAccountToTransfer,
    debouncedSearchText,
    isLoadingBalances,
    isLoadingPendingBalances,
    isLoadingPrices,
    processedDataByChain,
  ])

  return (
    <>
      {accountToTransfer && (
        <TransferDialog
          account={accountToTransfer}
          accountBalance={accountToTransfer?.balance || 0}
          open={!!accountToTransfer}
          onClose={onCloseTransferDialog}
        />
      )}

      <CreateUpdateDialog
        open={!!accountToEdit}
        onClose={onCloseEditAccount}
        accountToEdit={accountToEdit}
      />
      <ViewDialog
        open={showViewDialog}
        wallet={accountToView}
        name={accountToView?.name || ''}
        onClose={onCloseViewDialog}
      />
      <Stack flexGrow={1} height={minHeight}>
        <Header
          onChangeSelectedAccounts={onChangeSelectedAccounts}
          selectedAccounts={selectedAccounts}
          chainsWithAccounts={chainsWithAccounts}
          onSearchChange={onSearchChange}
          searchText={searchText}
          onClearSearch={onClearSearch}
        />

        <Stack overflow={'auto'} flexGrow={1} pr={1}>
          {contentList}
        </Stack>
      </Stack>
    </>
  )
}

export default Accounts
