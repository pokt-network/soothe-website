import * as React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useCallback, useMemo } from 'react'

interface RouteMenuProps {
  label: string
  items: Array<{
    label: string
    onClick: () => void
  }>
}

export default function RouteMenu({ label, items }: RouteMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = !!anchorEl
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const menuItemsComponent = useMemo(() => {
    return items.map(({ label, onClick }) => (
      <MenuItem
        key={label}
        onClick={() => {
          handleClose()
          onClick()
        }}
      >
        {label}
      </MenuItem>
    ))
  }, [items, handleClose])

  return (
    <div>
      <Button
        onClick={handleClick}
        sx={{
          textTransform: 'none',
        }}
      >
        {label}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {menuItemsComponent}
      </Menu>
    </div>
  )
}
