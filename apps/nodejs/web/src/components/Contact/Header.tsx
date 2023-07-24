'use client'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CreateContactDialog from '@/components/Contact/CreateUpdateDialog'
import {useCallback, useState} from 'react'

const Header = () => {
  const [showCreateContactDialog, setShowCreateContactDialog] = useState(false)

  const toggleShowCreateContactDialog = useCallback(() => {
    setShowCreateContactDialog(prevState => !prevState)
  }, [])

  return (
    <>
      <CreateContactDialog onClose={toggleShowCreateContactDialog} open={showCreateContactDialog}/>
      <Stack height={50} alignItems={'center'} direction={'row'} justifyContent={'space-between'} paddingX={'15px'}
             border={'1px solid black'}>
        <Typography>Contacts</Typography>
        <Button sx={{textTransform: 'none'}} onClick={toggleShowCreateContactDialog}>+ Add contact</Button>
      </Stack>
    </>

  )
}

export default Header
