import type { Theme } from '@mui/material'
import styled from '@mui/material/styles/styled'
import React, { useCallback, useMemo } from 'react'
import useTheme from '@mui/material/styles/useTheme'
import Menu, { MenuProps } from '@mui/material/Menu'
import Stack, { StackProps } from '@mui/material/Stack'
import Button, { ButtonProps } from '@mui/material/Button'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import DropDownIcon from '../assets/icons/down_arrow.svg'

export interface ButtonItemProps {
  onClick: () => void
  onAuxClick?: () => void
  label: React.ReactNode
}

interface WithoutOptions extends ButtonItemProps {
  type: 'button'
}

interface WithOptions {
  type: 'menu'
  label: string
  options: ButtonItemProps[]
}

type TypeOfButton = WithOptions | WithoutOptions

export type RouteButtonProps = {
  selected: boolean
  buttonProps?: ButtonProps
  containerProps?: StackProps
  menuProps?: MenuProps
  menuItemProps?: MenuItemProps
} & TypeOfButton

interface StyledButtonProps extends ButtonProps {
  selected?: boolean
}

const StyledButton = styled(Button)<StyledButtonProps>((props) => {
  const theme = props.theme as Theme

  return {
    paddingLeft: '20px',
    paddingRight: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    color: props.selected ? theme.customColors.white : theme.customColors.dark50,
    letterSpacing: '1px',
    '& path': {
      ...(props.selected && {
        stroke: theme.customColors.white,
      }),
    },
  }
})

const RouteButton: React.FC<RouteButtonProps> = ({
  selected,
  containerProps,
  buttonProps: customButtonProps,
  menuProps,
  menuItemProps,
  ...buttonProp
}) => {
  const theme: Theme = useTheme()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const buttonComponent = useMemo(() => {
    if (buttonProp.type === 'button') {
      const { label, onClick, onAuxClick } = buttonProp
      return (
        <StyledButton
          {...customButtonProps}
          onClick={onClick}
          onAuxClick={onAuxClick}
          selected={selected}
        >
          {label}
        </StyledButton>
      )
    } else {
      const { label, options } = buttonProp
      return (
        <>
          <StyledButton {...customButtonProps} onClick={handleOpenMenu} selected={selected}>
            {label} <DropDownIcon style={{ marginLeft: '10px' }} />
          </StyledButton>
          <Menu
            sx={{
              marginTop: '-10px',
            }}
            {...menuProps}
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={handleCloseMenu}
            disableScrollLock={true}
          >
            {options.map(({ label, onClick, onAuxClick }, index) => (
              <MenuItem
                {...menuItemProps}
                key={index}
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
            ))}
          </Menu>
        </>
      )
    }
  }, [
    selected,
    buttonProp,
    anchorEl,
    handleOpenMenu,
    handleCloseMenu,
    menuProps,
    menuItemProps,
    customButtonProps,
  ])

  const selectedComponent = useMemo(() => {
    if (!selected) return

    return (
      <Stack
        height={'4px'}
        sx={{
          width: '100%',
          borderTopRightRadius: '2px',
          borderTopLeftRadius: '2px',
          backgroundColor: theme.customColors.sky_blue,
          bottom: 0,
          position: 'absolute',
        }}
      />
    )
  }, [selected, theme])

  return (
    <Stack height={60} {...containerProps} position={'relative'}>
      {buttonComponent}
      {selectedComponent}
    </Stack>
  )
}

export default RouteButton
