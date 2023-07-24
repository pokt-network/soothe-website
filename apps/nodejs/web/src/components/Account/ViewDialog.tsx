import { type Theme, useTheme } from '@mui/material'
import QRCode from 'react-qr-code'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import { useCallback, useMemo, useState } from 'react'
import DialogActions from '@mui/material/DialogActions'
import CopyIcon from '@soothe/ui/src/assets/icons/copy.svg'
import DialogHeader from '@/components/common/DialogHeader'
import { DataByChain, SupportedChains } from '@/constants/supportedChains'

interface ViewDialogProps {
  open: boolean
  name: string
  wallet: {
    address: string
    chain: SupportedChains
  } | null
  onClose: () => void
}

const ViewDialog = ({ open, wallet, name, onClose }: ViewDialogProps) => {
  const theme: Theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const [showCopyTooltip, setShowCopyTooltip] = useState(false)

  const onClickCopyAddress = useCallback(() => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.address).then(() => {
        setShowCopyTooltip(true)
        setTimeout(() => {
          setShowCopyTooltip(false)
        }, 700)
      })
    }
  }, [wallet])

  const { label: chainLabel, icon: Icon } = useMemo(() => {
    if (!wallet?.chain) {
      return {
        label: '',
        icon: () => null,
      }
    }

    return DataByChain[wallet.chain]
  }, [wallet?.chain])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={'xs'}
      fullScreen={isXs}
      PaperProps={{
        sx: {
          width: { sm: 400 },
          height: { sm: 540 },
        },
      }}
    >
      <DialogHeader onClose={onClose}>
        <Stack direction={'row'} spacing={'10px'} height={'100%'} alignItems={'center'}>
          <Stack
            sx={{
              width: 20,
              height: 20,
              '& path': {
                transform: 'scale(0.67)',
              },
            }}
          >
            <Icon />
          </Stack>
          <Typography variant={'h6'} color={theme.customColors.white} fontWeight={700}>
            {chainLabel}
          </Typography>
        </Stack>
      </DialogHeader>

      <DialogContent
        sx={{
          paddingY: '20px!important',
          paddingX: 1.5,
          backgroundColor: theme.customColors.dark2,
        }}
      >
        <Stack alignItems={'center'} spacing={2}>
          <Typography
            textOverflow={'ellipsis'}
            whiteSpace={'nowrap'}
            overflow={'hidden'}
            height={'30px'}
            width={'100%'}
            fontWeight={600}
            letterSpacing={'0.5px'}
            color={theme.customColors.dark100}
          >
            {name}
          </Typography>
          <QRCode value={wallet?.address || ''} size={240} />

          <Stack width={'100%'} marginTop={'30px!important'}>
            <Typography fontWeight={600} letterSpacing={'0.5px'}>
              Account Address
            </Typography>
            <Stack
              direction={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
              width={'100%'}
              height={30}
            >
              <Typography
                color={'darkgray'}
                fontWeight={600}
                fontSize={14}
                sx={{
                  wordBreak: 'break-all',
                }}
                lineHeight={'16px'}
                marginTop={0.5}
              >
                {wallet?.address}
              </Typography>
              <Tooltip title={'Copied'} open={showCopyTooltip}>
                <IconButton
                  onClick={onClickCopyAddress}
                  sx={{
                    padding: 0,
                    marginLeft: 0.5,
                  }}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant={'outlined-cancel'} onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewDialog
