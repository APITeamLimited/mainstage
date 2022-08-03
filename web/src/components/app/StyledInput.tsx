import { Input, InputBase, SxProps, Theme, useTheme } from '@mui/material'

type StyledInputProps = {
  value: string
  onChangeValue?: (value: string) => void
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  sx?: SxProps<Theme>
}

/**
 * Input styled in the same way as EnvironmentTextField.
 */
export const StyledInput = ({
  value,
  onChange,
  onChangeValue,
  sx,
}: StyledInputProps) => {
  const theme = useTheme()

  return (
    <InputBase
      value={value}
      onChange={(e) => {
        onChange?.(e)
        onChangeValue?.(e.target.value)
      }}
      sx={{
        animationDirection: '0.01s',
        animationName: 'mui-auto-fill-cancel',
        appearance: 'auto',
        backgroundAttachment: 'scroll',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        textAlign: 'start',
        textIndent: '0px',
        textRendering: 'auto',
        textShadow: 'none',
        textTransform: 'none',
        display: 'flex',
        fontSize: '16px',
        fontStretch: '100%',
        fontStyle: 'normal',
        lineHeight: '23px',
        letterSpacing: 'normal',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: theme.palette.alternate.dark,
        borderRadius: 1,
        borderColor: 'transparent',
        outlineColor: theme.palette.primary.main,
        outlineOffset: '-1px',
        overflowWrap: 'anywhere',
        height: '40px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        paddingLeft: '15px',
        paddingRight: '15px',
        textOverflow: 'hidden',
        maxWidth: '100%',
        ...sx,
      }}
    />
  )
}
