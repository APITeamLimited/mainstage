import CloseIcon from '@mui/icons-material/Close'
import { useTheme, Chip, ChipProps } from '@mui/material'

type LevelChipProps = ChipProps & {
  showCloseIcon?: boolean
}

export const LevelChip = (props: LevelChipProps) => {
  const theme = useTheme()

  return (
    <Chip
      {...props}
      style={{
        backgroundColor:
          props.variant === 'outlined'
            ? undefined
            : props.label === 'error'
            ? theme.palette.error.main
            : props.label === 'warn' || props.label === 'warning'
            ? theme.palette.warning.main
            : props.label === 'info'
            ? theme.palette.info.light
            : undefined,

        borderColor:
          props.variant === 'outlined'
            ? props.label === 'error'
              ? theme.palette.error.main
              : props.label === 'warn' || props.label === 'warning'
              ? theme.palette.warning.main
              : props.label === 'info'
              ? theme.palette.info.light
              : undefined
            : undefined,

        ...props.style,

        // Add end addorment to the chip
      }}
      icon={props.showCloseIcon ? <CloseIcon size="small" /> : <></>}
    />
  )
}
