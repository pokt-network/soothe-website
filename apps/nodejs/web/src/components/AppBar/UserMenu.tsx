import React, { useCallback, useRef, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import { ClickAwayListener, Divider, Theme, TypographyProps, useTheme } from '@mui/material'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import styled from '@mui/system/styled'

const InteractiveTypography = styled(Typography)<TypographyProps>((props) => {
  const theme = props.theme as Theme
  return {
    fontSize: 12,
    textAlign: 'right',
    width: '100%',
    color: theme.customColors.dark100,
    height: 20,
    fontWeight: 600,
    lineHeight: '24px',
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  }
})

interface UserMenuProps {
  workspaceName: string
  onSignOut?: () => void
  onExportWorkspace?: () => void
}

const UserMenu: React.FC<UserMenuProps> = ({ workspaceName, onSignOut, onExportWorkspace }) => {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShoeMenu] = useState(false)

  const theme: Theme = useTheme()

  const toggleShowMenu = useCallback(() => {
    setShoeMenu((prevState) => !prevState)
  }, [])

  return (
    <>
      <Avatar
        sx={{
          height: 30,
          width: 30,
          cursor: 'pointer',
        }}
        ref={anchorRef}
        onClick={toggleShowMenu}
      >
        {workspaceName.substring(0, 1)}
      </Avatar>
      <Popper
        open={showMenu}
        anchorEl={anchorRef.current}
        transition
        sx={{
          zIndex: (theme) => theme.zIndex.appBar + 1,
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Box
              sx={{
                marginTop: '5px',
                marginRight: '20px',
              }}
            >
              <ClickAwayListener onClickAway={toggleShowMenu}>
                <Box
                  sx={{
                    p: 1,
                    bgcolor: 'background.paper',
                    borderRadius: '4px',
                    boxShadow: '2px 4px 15px -6px rgba(0,0,0,0.49)',
                    width: 150,
                  }}
                >
                  <Typography
                    textAlign={'right'}
                    textOverflow={'ellipsis'}
                    whiteSpace={'nowrap'}
                    overflow={'hidden'}
                    lineHeight={'24px'}
                  >
                    {workspaceName}
                  </Typography>
                  <Typography
                    variant={'body2'}
                    color={theme.customColors.dark50}
                    textAlign={'right'}
                  >
                    Workspace
                  </Typography>
                  <Divider sx={{ marginY: '5px' }} />
                  <InteractiveTypography onClick={onExportWorkspace}>
                    Export Workspace
                  </InteractiveTypography>

                  <Divider sx={{ marginY: '5px' }} />
                  <InteractiveTypography
                    sx={{
                      color: theme.customColors.red,
                    }}
                    onClick={onSignOut}
                  >
                    Sign Out
                  </InteractiveTypography>
                </Box>
              </ClickAwayListener>
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserMenu
