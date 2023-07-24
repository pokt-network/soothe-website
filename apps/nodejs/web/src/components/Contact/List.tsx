'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { IconButton } from '@mui/material'
import Button from '@mui/material/Button'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useCallback, useState } from 'react'
import { Contact } from '@/types'
import CreateContactDialog from '@/components/Contact/CreateUpdateDialog'
import { remove } from '@/features/contact/slice'
import { useSnackbar } from 'notistack'

const List = () => {
  const { enqueueSnackbar } = useSnackbar()

  const dispatch = useAppDispatch()
  const contacts = useAppSelector((state) => state.contact.contacts) as Contact[]
  const [contactToEdit, setContactToEdit] = useState<Contact>()

  const onCloseEditContactDialog = useCallback(() => {
    setContactToEdit(null)
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

  if (!contacts?.length) {
    return (
      <Stack>
        <Typography>{"You don't have any contact yet."}</Typography>
      </Stack>
    )
  }

  return (
    <>
      <CreateContactDialog
        onClose={onCloseEditContactDialog}
        open={!!contactToEdit}
        contactToUpdate={contactToEdit}
      />
      <Stack marginTop={'10px'} spacing={'10px'}>
        {contacts.map((contact) => {
          const { display_name, _id } = contact

          return (
            <Stack
              key={_id}
              paddingX={'15px'}
              paddingY={'10px'}
              border={'1px solid black'}
              direction={'row'}
              justifyContent={'space-between'}
            >
              <Stack direction={'row'} width={'100%'} alignItems={'center'}>
                <Typography display={'inline'} textTransform={'uppercase'}>
                  {display_name}
                </Typography>
              </Stack>
              <Stack direction={'row'}>
                <Button onClick={() => setContactToEdit(contact)}>Edit</Button>
                <IconButton onClick={() => onRemoveContact(contact)}>
                  <DeleteForeverIcon />
                </IconButton>
              </Stack>
            </Stack>
          )
        })}
      </Stack>
    </>
  )
}

export default List
