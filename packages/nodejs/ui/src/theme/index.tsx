import React from 'react'
import { createTheme, ThemeProvider as ThemeProviderMui } from '@mui/material'
import { SootheColors, ThemeOptions } from '@mui/material/styles'
import Box from '@mui/material/Box'
import DropDownArrowIcon from '../assets/icons/down_arrow.svg'

declare module '@mui/material/styles' {
  interface SootheColors {
    white: string
    black: string
    dark100: string
    dark90: string
    dark75: string
    dark50: string
    dark25: string
    dark15: string
    dark5: string
    dark2: string
    dark1: string
    primary999: string
    primary500: string
    red: string
    dark_green: string
    sky_blue: string
  }

  interface Theme {
    customColors: SootheColors
  }

  // allow configuration using `createTheme`
  interface ThemeOptions {
    customColors: SootheColors
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    'outlined-cancel': true
  }
}

const customColors: SootheColors = {
  white: '#FFFFFF',
  black: '#111111',
  dark100: '#272727',
  dark90: '#333333',
  dark75: '#5D5D5D',
  dark50: '#939393',
  dark25: '#C9C9C9',
  dark15: '#DFDFDF',
  dark5: '#F4F4F4',
  dark2: '#FBFBFB',
  dark1: '#E5E5E5',
  primary999: '#152A48',
  primary500: '#1E70EB',
  red: '#DB2727',
  dark_green: '#0F7739',
  sky_blue: '#5DB7E7',
}

const defaultTypography: ThemeOptions['typography'] = {
  fontFamily: 'inherit',
  fontSize: 14,
  h1: {
    fontSize: 36,
  },
  h2: {
    fontSize: 28,
  },
  h3: {
    fontSize: 24,
  },
  h4: {
    fontSize: 20,
  },
  h5: {
    fontSize: 18,
  },
  h6: {
    fontSize: 16,
  },
  body1: {
    fontSize: 14,
  },
  body2: {
    fontSize: 12,
  },
  subtitle1: {
    fontSize: 10,
  },
  button: {
    fontSize: 14,
    fontWeight: 700,
  },
}

const defaultOptions: ThemeOptions = {
  palette: {
    common: {
      black: customColors.dark100,
      white: customColors.white,
    },
    primary: {
      main: customColors.primary500,
    },
    secondary: {
      main: customColors.dark75,
    },
    success: {
      main: customColors.dark_green,
      contrastText: customColors.white,
    },
    error: {
      main: customColors.red,
      contrastText: customColors.white,
    },
    info: {
      //todo: change
      main: customColors.primary500,
      contrastText: customColors.white,
    },
    grey: {
      '50': customColors.dark2,
      '100': customColors.dark5,
      '200': customColors.dark15,
      '300': customColors.dark25,
      '400': customColors.dark50,
      '500': customColors.dark75,
      '600': customColors.dark90,
      '700': customColors.dark100,
    },
  },
  customColors,
  spacing: 10,
  typography: defaultTypography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          textTransform: 'none',
          height: 30,
          ...(ownerState.variant === 'outlined' && {
            color: customColors.primary500,
            borderColor: customColors.primary500,
            backgroundColor: customColors.white,
          }),
        }),
      },
      variants: [
        {
          props: { variant: 'outlined-cancel' },
          style: {
            color: customColors.dark50,
            border: `1px solid ${customColors.dark50}`,
            backgroundColor: customColors.white,
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiModal: {
      defaultProps: {
        // disableScrollLock: true,
      },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: DropDownArrowIcon,
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        popupIcon: <DropDownArrowIcon />,
      },
      styleOverrides: {
        endAdornment: {
          right: '8px!important',
        },

        popupIndicator: {
          marginTop: '-2px',
          '& path': {
            stroke: customColors.dark100,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: customColors.white,
            borderRadius: '2px',
            '& input': {
              paddingLeft: '10px',
              paddingRight: '10px',
            },
          },
          '& fieldset': {
            borderColor: customColors.dark50,
          },
          '& .MuiSelect-icon': {
            marginTop: '-8px',
            '& path': {
              stroke: customColors.dark100,
            },
          },
          '& .MuiInputBase-root.Mui-disabled': {
            '& path': {
              stroke: customColors.dark15,
            },
          },
          '& input[type=number]': {
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            MozAppearance: 'textfield',
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: customColors.dark2,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 70,
          padding: '20px 15px',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&.MuiInputLabel-shrink': {
            transform: 'translate(13px, -9px) scale(0.77)',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          width: 'calc(100% - 14px)',
          position: 'absolute',
          left: 14,
          bottom: -16,
          margin: 0,
          fontSize: 11,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: customColors.dark25,
        },
      },
    },
    ['MuiDataGrid' as 'MuiTextField']: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: customColors.dark50,
            fontSize: 14,
            fontWeight: 600,
          },
          '& .MuiDataGrid-cell': {
            fontSize: 16,
          },
        },
      },
    },
  },
}

interface ThemeProviderProps {
  children: React.ReactNode
}

const theme = createTheme(defaultOptions)

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <ThemeProviderMui theme={theme}>{children}</ThemeProviderMui>
}

export default ThemeProvider
