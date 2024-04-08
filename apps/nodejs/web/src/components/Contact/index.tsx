'use client'
import type { Contact, Wallet } from '@/types'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { remove } from '@/features/contact/slice'
import useDebounce from '@/hooks/useDebounce'
import List from '@/components/Contact/List'
import Header from '@/components/Contact/Header'
import ViewDialog from '@/components/Account/ViewDialog'
import CreateContactDialog from '@/components/Contact/CreateUpdateDialog'

function lowCaseAndTrim(str: string) {
  return (str || '').trim().toLowerCase()
}

export default function ContactsIndex() {
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const contacts = useAppSelector((state) => state.contact.contacts) as Contact[]

  const [contactToEdit, setContactToEdit] = useState<Contact>()
  const [walletToView, setWalletToView] = useState<Wallet>(null)
  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebounce(searchText, 300)
  const [showCreateContact, setShowCreateContact] = useState(false)

  const toggleShowCreateContactDialog = useCallback(() => {
    setShowCreateContact((prevState) => !prevState)
  }, [])

  const onSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }, [])

  const onClearSearch = useCallback(() => {
    setSearchText('')
  }, [])

  const onCloseEditContactDialog = useCallback(() => {
    setContactToEdit(null)
  }, [])

  const onEditContactDialog = useCallback((contact: Contact) => {
    setContactToEdit(contact)
  }, [])

  const onOpenWallet = useCallback((wallet: Wallet) => {
    setWalletToView(wallet)
  }, [])

  const onCloseWallet = useCallback(() => {
    setWalletToView(null)
  }, [])

  const onRemoveContact = useCallback(
    (contact: Contact) => {
      dispatch(remove(contact._id)).then((response) => {
        if ('error' in response) {
          enqueueSnackbar(`Error while trying to remove "${contact.display_name}" contact.`, {
            variant: 'error',
            autoHideDuration: 4000,
          })
          return
        }

        enqueueSnackbar(`Successfully removed "${contact.display_name}" contact.`, {
          variant: 'success',
          autoHideDuration: 4000,
        })
      })
    },
    [dispatch, enqueueSnackbar]
  )

  const filteredContacts = useMemo(() => {
    if (!debouncedSearchText) return contacts

    const text = lowCaseAndTrim(debouncedSearchText)

    return contacts.filter((contact) => {
      const {
        display_name,
        type,
        company_name,
        last_name,
        first_name,
        wallets,
        phone_number,
        email,
      } = contact

      if (lowCaseAndTrim(display_name).includes(text)) return true
      if (lowCaseAndTrim(type).includes(text)) return true
      if (lowCaseAndTrim(company_name).includes(text)) return true
      if (lowCaseAndTrim(last_name).includes(text)) return true
      if (lowCaseAndTrim(first_name).includes(text)) return true
      if (lowCaseAndTrim(phone_number).includes(text)) return true
      if (lowCaseAndTrim(email).includes(text)) return true

      for (const { address, chain, description, alias } of wallets) {
        if (lowCaseAndTrim(address).includes(text)) return true
        if (lowCaseAndTrim(chain).includes(text)) return true
        if (lowCaseAndTrim(description).includes(text)) return true
        if (lowCaseAndTrim(alias).includes(text)) return true
      }

      return false
    })
  }, [debouncedSearchText, contacts])

  return (
    <>
      <CreateContactDialog
        onClose={showCreateContact ? toggleShowCreateContactDialog : onCloseEditContactDialog}
        contactToUpdate={contactToEdit}
        open={showCreateContact || !!contactToEdit}
      />
      <ViewDialog
        open={!!walletToView}
        wallet={walletToView}
        name={walletToView?.alias || 'N/A'}
        onClose={onCloseWallet}
      />
      <Header
        onClearSearch={onClearSearch}
        onSearchChange={onSearchChange}
        searchText={searchText}
        toggleShowCreateContactDialog={toggleShowCreateContactDialog}
      />
      <List
        contacts={filteredContacts}
        onEditContactDialog={onEditContactDialog}
        onRemoveContact={onRemoveContact}
        onOpenWallet={onOpenWallet}
      />
    </>
  )
}
