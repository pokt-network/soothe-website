'use client'

import type { Breakpoint, Theme } from '@mui/material'
import Cookies from 'js-cookie'
import { saveAs } from 'file-saver'
import Stack from '@mui/material/Stack'
import styled from '@mui/system/styled'
import Toolbar from '@mui/material/Toolbar'
import MuiAppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'
import { usePathname, useRouter } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import { AppBarHeight, SESSION_COOKIE_NAME } from '@/constants'
import UserMenu from '@/components/AppBar/UserMenu'
import { exportWorkspace } from '@/datasource/workspace'
import { clearWorkspace } from '@/features/workspace/slice'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { reset as resetAccounts } from '@/features/account/slice'
import { reset as resetContacts } from '@/features/contact/slice'
import CreateContactDialog from '@/components/Contact/CreateUpdateDialog'
import RouteButton, { RouteButtonProps } from '@soothe/ui/src/components/RouteButton'
import ConnectButton from '@/components/AppBar/ConnectButton'
import { SupportedExtensionsProtocol } from '@/provider'

const StyledToolbar = styled(Toolbar)((param) => {
  const theme: Theme = param.theme as unknown as Theme

  const heightObj = {}

  for (const breakpoint of Object.keys(AppBarHeight)) {
    heightObj[theme.breakpoints.up(breakpoint as Breakpoint)] = {
      height: AppBarHeight[breakpoint],
      minHeight: AppBarHeight[breakpoint],
    }
  }

  return {
    ...heightObj,
    backgroundColor: theme.customColors.primary999,
    paddingRight: `30px!important`,
    paddingLeft: `10px!important`,
  }
})

interface AppBarProps {
  justDisplayLogo?: boolean
}

const AppBar: React.FC<AppBarProps> = ({ justDisplayLogo }) => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [showCreateContactDialog, setShowCreateContactDialog] = useState(false)

  const toggleShowCreateContactDialog = useCallback(() => {
    setShowCreateContactDialog((prevState) => !prevState)
  }, [])

  const { workspace } = useAppSelector((state) => state.workspace)

  const onExportWorkspace = useCallback(() => {
    if (workspace) {
      exportWorkspace(workspace._id).then((json) => {
        if (json) {
          const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
          saveAs(blob, 'workspace.json')
        }
      })
    }
  }, [workspace])

  const onSignOutClick = useCallback(() => {
    Cookies.remove(SESSION_COOKIE_NAME, { path: '/' })
    dispatch(clearWorkspace())
    dispatch(resetAccounts())
    dispatch(resetContacts())
  }, [dispatch])

  const routeItems: RouteButtonProps[] = useMemo(() => {
    return [
      {
        type: 'button',
        label: 'Accounts',
        onClick: () => router.push('/'),
        onAuxClick: () => router.push('/'),
        selected: pathname === '/' || pathname.startsWith('/account/'),
      },
      {
        type: 'menu',
        label: 'Contacts',
        options: [
          {
            label: 'Create Contact',
            onClick: toggleShowCreateContactDialog,
          },
          {
            label: 'Manage Contact',
            onClick: () => {
              router.push('/contacts')
            },
          },
        ],
        selected: pathname.startsWith('/contact'),
      },
      {
        type: 'button',
        label: 'Transfer',
        onClick: () => router.push('/transfer'),
        onAuxClick: () => router.push('/transfer'),
        selected: pathname === '/transfer',
      },
    ]
  }, [pathname, toggleShowCreateContactDialog, router])

  return (
    <>
      <CreateContactDialog onClose={toggleShowCreateContactDialog} open={showCreateContactDialog} />
      <MuiAppBar
        sx={{
          height: AppBarHeight,
          minHeight: AppBarHeight,
        }}
        position={'fixed'}
        elevation={0}
      >
        <StyledToolbar>
          <Stack
            direction={'row'}
            flexGrow={1}
            position={'relative'}
            height={AppBarHeight}
            display={justDisplayLogo ? 'none' : 'flex'}
          >
            <Stack
              direction={'row'}
              width={'100vw'}
              alignItems={'center'}
              justifyContent={'center'}
              position={'absolute'}
              left={0}
            >
              {routeItems.map((item, index) => (
                <RouteButton key={index} {...item} />
              ))}
            </Stack>

            <Stack direction={'row'} justifyContent={'space-between'} width={'100%'}>
              <Stack alignItems={'center'} justifyContent={'center'} paddingX={0.5}>
                <Typography variant={'h3'} letterSpacing={'1px'} fontWeight={600}>
                  SOOTHE
                </Typography>
              </Stack>

              <Stack
                direction={'row'}
                spacing={'5px'}
                alignItems={'center'}
                display={justDisplayLogo ? 'none' : 'flex'}
              >
                <ConnectButton protocol={SupportedExtensionsProtocol.Pocket} />
                <ConnectButton protocol={SupportedExtensionsProtocol.Ethereum} />
                <UserMenu
                  workspaceName={workspace.name}
                  onExportWorkspace={onExportWorkspace}
                  onSignOut={onSignOutClick}
                />
              </Stack>
            </Stack>
          </Stack>
        </StyledToolbar>
      </MuiAppBar>
      <StyledToolbar />
    </>
  )
}

export default AppBar
