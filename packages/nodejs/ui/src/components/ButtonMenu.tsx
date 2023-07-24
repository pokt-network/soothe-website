import type { ButtonItemProps } from './RouteButton'
import React, { useCallback, useMemo } from 'react'
import Button, { ButtonProps } from '@mui/material/Button'
import Menu, { MenuProps } from '@mui/material/Menu'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import DropDownIcon from '../assets/icons/down_arrow.svg'
import { Theme } from '@mui/material'
import useTheme from '@mui/material/styles/useTheme'

interface ButtonMenuProps {
  label: React.ReactNode
  options: ButtonItemProps[]
  buttonProps?: ButtonProps
  menuProps?: MenuProps
  menuItemProps?: MenuItemProps
}

const ButtonMenu: React.FC<ButtonMenuProps> = ({
  label,
  options,
  menuItemProps,
  menuProps,
  buttonProps,
}) => {
  const theme: Theme = useTheme()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const menuItemsComponent = useMemo(() => {
    return options.map(({ label, onClick, onAuxClick }) => (
      <MenuItem
        {...menuItemProps}
        key={label}
        onClick={() => {
          handleCloseMenu()
          onClick()
        }}
        onAuxClick={() => {
          if (onAuxClick) {
            handleCloseMenu()
            onAuxClick()
          }
        }}
      >
        {label}
      </MenuItem>
    ))
  }, [options, handleCloseMenu, menuItemProps])

  return (
    <>
      <Button
        variant={'outlined'}
        {...buttonProps}
        sx={{
          height: 30,
          width: 80,
          paddingX: 0,
          '& path': {
            stroke: theme.customColors.primary500,
          },
          ...buttonProps?.sx,
        }}
        onClick={handleOpenMenu}
      >
        {label}
        <DropDownIcon style={{ marginRight: '-5px' }} />
      </Button>
      <Menu
        {...menuProps}
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleCloseMenu}
        disableScrollLock={true}
      >
        {menuItemsComponent}
      </Menu>
    </>
  )
}

export default ButtonMenu
