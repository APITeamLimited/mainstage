import CloseIcon from '@mui/icons-material/Close'
import DoneIcon from '@mui/icons-material/Done'
import { Chip } from '@mui/material'
type DomainVerifiedChipProps = {
  verified: boolean
}

export const DomainVerifiedChip = ({ verified }: DomainVerifiedChipProps) => (
  <Chip
    label={verified ? 'Verified' : 'Not Verified'}
    color={verified ? 'success' : 'error'}
    size="small"
    sx={{
      fontSize: '10px',
      padding: 0,
      '& .MuiChip-label': {
        paddingX: '6px',
        fontWeight: 'bold',
        userSelect: 'none',
      },
      marginLeft: 1,
      transistion: 'background-color 0',
      height: '20px',
    }}
    icon={verified ? <DoneIcon /> : <CloseIcon />}
  />
)
