import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import type { LabelAndValue } from '@/types'
import React, { useMemo } from 'react'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'
import { useFormContext } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import { labelByChainMap, NetworksByChains } from '@/constants/supportedChains'
import { useAppSelector } from '@/hooks/redux'
import { roundAndSeparate } from '@/utils'

interface RowProps {
  row: LabelAndValue<string | undefined>
}

const Row = ({ row: { label, value } }: RowProps) => {
  const theme = useTheme()
  return (
    <Stack direction={'row'} spacing={1.5}>
      <Typography
        width={100}
        textAlign={'right'}
        fontWeight={600}
        letterSpacing={'0.5px'}
        variant={'body2'}
      >
        {label}:
      </Typography>
      <Typography
        color={theme.customColors.dark75}
        width={'100%'}
        letterSpacing={'0.5px'}
        sx={{ wordBreak: 'break-all' }}
        variant={'body2'}
      >
        {value}
      </Typography>
    </Stack>
  )
}

export default function TransferSummary() {
  const theme = useTheme()
  const { watch } = useFormContext<TransferFormValues>()
  const values = watch()

  const { accountsMap } = useAppSelector((state) => state.account)
  const { contactsMap } = useAppSelector((state) => state.contact)
  const purposes = useAppSelector((state) => state.purpose.purposes)

  const rows: LabelAndValue<string | undefined>[] = useMemo(() => {
    const {
      chain,
      network,
      transfer_from,
      transfer_to,
      transfer_amount,
      purpose,
      recipient_message,
      new_contact_address,
      new_contact_name,
      new_purpose_name,
      adding_new_purpose,
    } = values

    let transferFrom: string, transferTo: string

    if (transfer_from) {
      const accountName = accountsMap[transfer_from]

      if (accountName) {
        const lastCharacters = transfer_from.substring(transfer_from.length - 10)

        transferFrom = `${accountName} (...${lastCharacters})`
      } else {
        transferFrom = transfer_from
      }
    } else {
      transferFrom = ''
    }

    if (transfer_to) {
      const accountName = contactsMap[transfer_to] || accountsMap[transfer_to]

      if (accountName) {
        if (accountName.includes('(') && accountName.includes(')')) {
          transferTo = accountName
        } else {
          const lastCharacters = transfer_to.substring(transfer_to.length - 10)
          transferTo = `${accountName} (...${lastCharacters})`
        }
      } else {
        transferTo = transfer_to
      }
    } else if (new_contact_address || new_contact_name) {
      const lastCharacters = new_contact_address
        ? ` (...${new_contact_address.substring(new_contact_address.length - 10)})`
        : ''

      transferTo = `${new_contact_name}${lastCharacters}`
    } else {
      transferTo = ''
    }

    let purposeLabel: string

    if (adding_new_purpose) {
      purposeLabel = new_purpose_name
    } else {
      purposeLabel = purposes.find((item) => item._id === purpose)?.name || purpose
    }

    return [
      {
        label: 'Asset',
        value: labelByChainMap[chain],
      },
      {
        label: 'Network',
        value: NetworksByChains[chain]?.find((item) => item.value === network)?.label,
      },
      {
        label: 'From',
        value: transferFrom,
      },
      {
        label: 'To',
        value: transferTo,
      },
      {
        label: 'Transfer Amount',
        value: transfer_amount ? `$${roundAndSeparate(Number(transfer_amount), 6)}` : '',
      },
      {
        label: 'Purpose',
        value: purposeLabel,
      },
      {
        label: 'Message to recipient',
        value: recipient_message,
      },
    ]
  }, [values, accountsMap, contactsMap, purposes])

  return (
    <Stack
      flexGrow={1}
      border={`1px solid ${theme.customColors.primary500}`}
      borderRadius={'8px'}
      maxWidth={'100%'}
      paddingY={1.5}
      paddingX={2}
    >
      <Typography
        height={30}
        textAlign={'center'}
        letterSpacing={'0.5px'}
        fontWeight={600}
        marginBottom={1}
      >
        Transfer Summary
      </Typography>
      <Divider sx={{ marginBottom: 2.5 }} />
      <Stack flexGrow={1} spacing={'10px'}>
        {rows.map((row) => (
          <Row key={row.label} row={row} />
        ))}
      </Stack>
    </Stack>
  )
}
