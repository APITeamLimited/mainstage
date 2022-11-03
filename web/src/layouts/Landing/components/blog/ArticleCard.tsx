import {
  Card,
  CardMedia,
  useTheme,
  CardContent,
  Box,
  Typography,
  Chip,
} from '@mui/material'

type ArticleCardProps = {
  articleId: string
  title: string
  description: string
  tags: string[]
  estimatedReadingMinutes: number
  date: Date
  authorName: string
  authorImage?: React.ReactNode
  previewImageSrc: string
}

export const ArticleCard = ({
  articleId,
  title,
  description,
  tags,
  estimatedReadingMinutes,
  date,
  authorName,
  authorImage,
  previewImageSrc,
}: ArticleCardProps) => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      <CardMedia
        title={title}
        src={previewImageSrc}
        sx={{
          position: 'relative',
          filter: theme.palette.mode === 'dark' ? 'brightness(0.7)' : 'none',
        }}
      />
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box display="flex" justifyContent="center" flexWrap="wrap">
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ marginBottom: 1, marginRight: 1 }}
            />
          ))}
        </Box>
        <Typography
          variant="h6"
          fontWeight={700}
          align="center"
          sx={{ textTransform: 'uppercase' }}
        >
          {title}
        </Typography>
        <Box marginY={1}>
          <Typography
            variant="caption"
            align="center"
            color="text.secondary"
            component="i"
          >
            {authorName} - {date.toLocaleDateString()}
          </Typography>
        </Box>
        <Typography color={theme.palette.text.secondary} align="center">
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}
