'use client'

import type { Workspace } from '@/types'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Button from '@mui/material/Button'
import useDebounce from '@/hooks/useDebounce'
import { searchWorkspaces } from '@/datasource/workspace'
import AddWorkspace, { AddWorkspaceDialog } from '@/components/Workspace/AddWorkspace'
import { CircularProgress } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import LogInWorkspace from '@/components/Workspace/LogIn'
import ImportDialog from '@/components/Workspace/ImportDialog'
import { useTheme } from '@mui/material/styles'
import RemoveWorkspaceDialog from '@/components/Workspace/RemoveWorkspaceDialog'

type Dialogs = 'none' | 'login' | 'import' | 'update' | 'add' | 'remove'

const List: React.FC = () => {
  const theme = useTheme()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [queryString, setQueryString] = useState('')
  const debouncedQueryString = useDebounce(queryString, 300)
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>(null)
  const [dialogToShow, setDialogToShow] = useState<Dialogs>('none')

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (dialogToShow === 'none') {
      timeout = setTimeout(() => {
        setSelectedWorkspace(null)
      }, 150)
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [dialogToShow])

  const loadWorkspaces = useCallback(() => {
    setIsLoading(true)

    searchWorkspaces(debouncedQueryString)
      .then((results) => {
        setWorkspaces(results)
      })
      .finally(() => setIsLoading(false))
  }, [debouncedQueryString])

  useEffect(() => {
    loadWorkspaces()
  }, [loadWorkspaces])

  const onOpenDialog = useCallback((dialogToOpen: Dialogs) => {
    setDialogToShow(dialogToOpen)
  }, [])

  const onSelectWorkspace = useCallback(
    (workspace: Workspace, dialogToOpen: Dialogs) => {
      setSelectedWorkspace(workspace)
      onOpenDialog(dialogToOpen)
    },
    [onOpenDialog]
  )

  const onCloseDialogs = useCallback(() => {
    setDialogToShow('none')
  }, [])

  const onChangeQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQueryString(event.target.value)
  }, [])

  const onRunAfterAddDialog = useCallback(() => {
    loadWorkspaces()
    onCloseDialogs()
  }, [onCloseDialogs, loadWorkspaces])

  return useMemo(() => {
    if (!debouncedQueryString && !workspaces.length && !isLoading) {
      return (
        <>
          <ImportDialog
            open={dialogToShow === 'import'}
            onClose={onCloseDialogs}
            runAfterImport={loadWorkspaces}
          />
          <AddWorkspace runAfterAdded={loadWorkspaces} onClickImport={onCloseDialogs} />
        </>
      )
    }

    if (selectedWorkspace && dialogToShow === 'login') {
      return <LogInWorkspace workspace={selectedWorkspace} onCancel={onCloseDialogs} />
    }

    let component: React.ReactNode

    if (isLoading || !workspaces.length) {
      component = (
        <Stack flexGrow={1} alignItems={'center'} justifyContent={'center'}>
          {isLoading ? (
            <CircularProgress size={80} sx={{ marginTop: '-50px' }} />
          ) : (
            <Typography sx={{ marginTop: '-50px' }}>No Results</Typography>
          )}
        </Stack>
      )
    } else {
      component = workspaces.map((item) => (
        <Stack
          key={item._id}
          spacing={'5px'}
          overflow={'auto'}
          paddingTop={'1px'}
          position={'relative'}
        >
          <Stack
            sx={{
              borderTop: '1px solid lightgray',
              paddingY: '10px',
              paddingX: '12px',
              userSelect: 'none',
              '&:hover': {
                backgroundColor: theme.customColors.dark2,
                cursor: 'pointer',
              },
            }}
          >
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} sx={{}}>
              <Typography onClick={() => onSelectWorkspace(item, 'login')} width={'100%'}>
                {item.name}
              </Typography>
              <Stack direction={'row'} spacing={0.5}>
                <IconButton onClick={() => onSelectWorkspace(item, 'update')}>
                  <EditIcon fontSize={'small'} />
                </IconButton>
                <IconButton onClick={() => onSelectWorkspace(item, 'remove')}>
                  <DeleteForeverIcon fontSize={'small'} />
                </IconButton>
              </Stack>
            </Stack>
            <Typography
              onClick={() => onSelectWorkspace(item, 'login')}
              width={'100%'}
              variant={'body2'}
              overflow={'hidden'}
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
              }}
              color={'gray'}
            >
              {item.description}
            </Typography>
          </Stack>
        </Stack>
      ))
    }

    return (
      <>
        <ImportDialog
          open={dialogToShow === 'import'}
          onClose={onCloseDialogs}
          runAfterImport={loadWorkspaces}
        />
        <AddWorkspaceDialog
          onClose={onCloseDialogs}
          open={dialogToShow === 'add' || dialogToShow === 'update'}
          workspaceToUpdate={selectedWorkspace}
          runAfterAdded={onRunAfterAddDialog}
        />
        <RemoveWorkspaceDialog
          open={dialogToShow === 'remove'}
          onClose={onCloseDialogs}
          workspace={selectedWorkspace}
          onRunAfterRemove={onRunAfterAddDialog}
        />
        <Stack
          sx={{
            height: { xs: '100%', sm: 520 },
            width: { xs: '100%', sm: 400 },
            boxShadow: '1px 6px 20px 1px rgba(0,0,0,0.15)',
            borderRadius: { sm: '8px' },
            padding: '15px',
          }}
          spacing={'15px'}
        >
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant={'h6'} marginTop={{ xs: '10px', sm: 0 }}>
              Select a Workspace
            </Typography>
            <Stack direction={'row'} spacing={'10px'}>
              <Button sx={{ textTransform: 'none' }} onClick={() => onOpenDialog('add')}>
                Add New
              </Button>
              <Button sx={{ textTransform: 'none' }} onClick={() => onOpenDialog('import')}>
                Import
              </Button>
            </Stack>
          </Stack>
          <Stack paddingBottom={'5px'}>
            <TextField
              label={'Search'}
              autoComplete={'off'}
              name={'search'}
              size={'small'}
              fullWidth
              value={queryString}
              onChange={onChangeQuery}
            />
          </Stack>

          {component}
        </Stack>
      </>
    )
  }, [
    onOpenDialog,
    dialogToShow,
    theme,
    debouncedQueryString,
    workspaces,
    isLoading,
    queryString,
    onChangeQuery,
    selectedWorkspace,
    onSelectWorkspace,
    onCloseDialogs,
    loadWorkspaces,
    onRunAfterAddDialog,
  ])
}

export default List
