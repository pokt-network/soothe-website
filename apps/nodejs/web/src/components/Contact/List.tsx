'use client'

import type { Contact, Wallet } from '@/types'
import React, { useState } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'
import Accordion from '@mui/material/Accordion'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import QrCodeIcon from '@mui/icons-material/QrCode'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import FilledDownArrowIcon from '@soothe/ui/src/assets/icons/filled_down_arrow.svg'
import ButtonMenu from '@soothe/ui/src/components/ButtonMenu'
import CopyIcon from '@soothe/ui/src/assets/icons/copy.svg'
import { DataByChain } from '@/constants/supportedChains'
import { ContactType } from '@/constants'

const labelByType: Record<ContactType, string> = {
  business: 'Business',
  personal: 'Personal',
}

interface WalletItemProps {
  wallet: Wallet
  onOpenWallet: (wallet: Wallet) => void
}

function WalletItem({ wallet, onOpenWallet }: WalletItemProps) {
  const theme = useTheme()
  const [showCopyTooltip, setShowCopyTooltip] = useState(false)

  const onClickCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address).then(() => {
      setShowCopyTooltip(true)
      setTimeout(() => {
        setShowCopyTooltip(false)
      }, 700)
    })
  }

  const ChainIcon = DataByChain[wallet.chain].icon

  return (
    <Stack direction={'row'} alignItems={'center'} spacing={1}>
      <Stack
        sx={{
          width: 20,
          height: 20,
          '& path': {
            transform: 'scale(0.67)',
          },
        }}
      >
        <ChainIcon />
      </Stack>
      <Stack width={'100%'} justifyContent={'center'}>
        <Stack direction={'row'} width={'100%'} alignItems={'center'}>
          <Typography
            textTransform={'uppercase'}
            lineHeight={'18px'}
            color={theme.customColors.dark100}
            fontWeight={500}
          >
            {wallet.alias || 'n/a'}
          </Typography>
          <IconButton
            onClick={() => onOpenWallet(wallet)}
            sx={{ marginLeft: '5px', padding: 0, marginTop: -0.3 }}
          >
            <QrCodeIcon sx={{ color: theme.customColors.dark100, fontSize: 18 }} />
          </IconButton>
        </Stack>

        <Stack direction={'row'} alignItems={'center'} spacing={0.5}>
          <Typography variant={'body2'}>{wallet.address}</Typography>
          <Tooltip title={'Copied'} open={showCopyTooltip}>
            <IconButton onClick={onClickCopyAddress}>
              <Stack
                sx={{
                  width: 20,
                  height: 20,
                  '& path, rect': { transform: 'scale(0.67)', stroke: theme.customColors.dark50 },
                }}
              >
                <CopyIcon />
              </Stack>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  )
}

interface ContactItemProps {
  contact: Contact
  onEditContactDialog: (contact: Contact) => void
  onRemoveContact: (contact: Contact) => void
  onOpenWallet: (wallet: Wallet) => void
}

const ContactItem = ({
  contact,
  onRemoveContact,
  onEditContactDialog,
  onOpenWallet,
}: ContactItemProps) => {
  const theme = useTheme()

  return (
    <Stack width={1} position={'relative'}>
      <Accordion
        sx={{
          border: `1px solid ${theme.customColors.dark50}`,
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)',
          borderRadius: '2px',
          marginTop: '0!important',
        }}
        elevation={0}
      >
        <AccordionSummary
          expandIcon={<FilledDownArrowIcon />}
          sx={{
            paddingLeft: '5px!important',
            maxHeight: 60,
            minHeight: '60px!important',
            flexDirection: 'row-reverse',
            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
              transform: 'rotate(0deg)',
            },
            '& .MuiAccordionSummary-expandIconWrapper': {
              transform: 'rotate(270deg)',
            },
          }}
        >
          <Stack
            direction={'row'}
            spacing={'10px'}
            alignItems={'center'}
            marginLeft={'5px'}
            height={60}
            width={1}
            justifyContent={'space-between'}
          >
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Typography color={theme.customColors.dark100} variant={'h4'} fontWeight={600}>
                {contact.display_name}
              </Typography>
              <Stack
                bgcolor={theme.customColors.dark15}
                paddingX={0.7}
                borderRadius={'4px'}
                height={24}
              >
                <Typography color={theme.customColors.dark90} lineHeight={'24px'}>
                  {contact.wallets.length} {contact.wallets.length > 1 ? 'Wallets' : 'Wallet'}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0, marginTop: '-10px' }}>
          <Stack paddingX={2} paddingTop={1} paddingBottom={2}>
            <Typography fontWeight={500} marginBottom={0.5} fontSize={16}>
              Contact Info
            </Typography>
            <Stack
              paddingX={1}
              sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
            >
              {[
                {
                  label: 'First Name',
                  value: contact.first_name,
                },
                {
                  label: 'Last Name',
                  value: contact.last_name,
                },
                {
                  label: 'Company Name',
                  value: contact.company_name,
                },
                {
                  label: 'Email',
                  value: contact.email,
                },
                {
                  label: 'Mobile',
                  value: contact.phone_number,
                },
                {
                  label: 'Type',
                  value: labelByType[contact.type],
                },
              ].map(({ label, value }) => (
                <Stack
                  key={label}
                  height={40}
                  // alignItems={'center'}
                  justifyContent={'center'}
                  width={1}
                >
                  <Typography fontWeight={500} noWrap={true}>
                    {value || '-'}
                  </Typography>
                  <Typography variant={'body2'}>{label}</Typography>
                </Stack>
              ))}
            </Stack>
            <Divider flexItem={true} sx={{ marginY: 1 }} />
            <Typography fontWeight={500} fontSize={16}>
              Wallets
            </Typography>
            <Stack paddingX={1} paddingTop={1} spacing={1}>
              {contact.wallets.map((wallet) => (
                <WalletItem wallet={wallet} key={wallet.address} onOpenWallet={onOpenWallet} />
              ))}
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Stack
        direction={'row'}
        spacing={1.6}
        alignItems={'center'}
        position={'absolute'}
        zIndex={2}
        right={16}
        top={16}
      >
        <Button
          variant={'outlined'}
          sx={{
            height: 30,
            width: 80,
          }}
          onClick={() => onEditContactDialog(contact)}
        >
          Edit
        </Button>
        <ButtonMenu
          label={'More'}
          options={[
            {
              label: 'Remove',
              onClick: () => onRemoveContact(contact),
            },
          ]}
        />
      </Stack>
    </Stack>
  )
}

interface ListProps {
  contacts: Array<Contact>
  onEditContactDialog: (contact: Contact) => void
  onRemoveContact: (contact: Contact) => void
  onOpenWallet: (wallet: Wallet) => void
}

const List = ({ contacts, onEditContactDialog, onRemoveContact, onOpenWallet }: ListProps) => {
  if (!contacts?.length) {
    return (
      <Stack>
        <Typography>{"You don't have any contact yet."}</Typography>
      </Stack>
    )
  }

  return (
    <>
      <Stack marginTop={1} spacing={2}>
        {contacts.map((contact) => (
          <ContactItem
            contact={contact}
            key={contact._id}
            onOpenWallet={onOpenWallet}
            onRemoveContact={onRemoveContact}
            onEditContactDialog={onEditContactDialog}
          />
        ))}
      </Stack>
    </>
  )
}

export default List
