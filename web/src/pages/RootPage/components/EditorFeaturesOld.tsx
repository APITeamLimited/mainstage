import {
  useTheme,
  Typography,
  ListItemText,
  ListItem,
  Grid,
  Box,
  Avatar,
  ListItemAvatar,
  useMediaQuery,
} from '@mui/material'

const editorFeatures = [
  'Unlimited users as standard',
  'Easy importing from Postman, Insomnia, or other API testing tools',
  'Design, debug and test your APIs in real-time',
  'Integrated scripting runtime',
]

const gridSpacing = 8

const EditorFeatures = (): JSX.Element => {
  const theme = useTheme()

  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Grid container spacing={isSmall ? 0 : gridSpacing} sx={{ width: '100%' }}>
      <Grid
        item
        container
        alignItems={'center'}
        xs={12}
        md={4}
        style={{
          paddingLeft: 0,
        }}
        sx={{
          paddingBottom: isSmall ? gridSpacing : undefined,
        }}
      >
        <Box>
          <Box marginBottom={2}>
            <Typography
              variant={'h4'}
              sx={{ fontWeight: 700 }}
              color={theme.palette.text.primary}
              gutterBottom
            >
              Real-time collaborative API development platform
            </Typography>
            <Typography
              sx={{
                color: theme.palette.text.secondary,
              }}
              variant={'h6'}
            >
              Design, debug and test your APIs in real-time with your whole team
              in our interractive editor.
            </Typography>
          </Box>
          <Grid container spacing={1}>
            {editorFeatures.map((item, i) => (
              <Grid item xs={12} key={i}>
                <Box
                  component={ListItem}
                  disableGutters
                  width={'auto'}
                  padding={0}
                >
                  <Box
                    component={ListItemAvatar}
                    minWidth={'auto !important'}
                    marginRight={2}
                  >
                    <Box
                      component={Avatar}
                      bgcolor={theme.palette.secondary.main}
                      width={20}
                      height={20}
                    >
                      <svg
                        width={12}
                        height={12}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Box>
                  </Box>
                  <ListItemText
                    primary={item}
                    sx={{
                      color: theme.palette.text.primary,
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        md={8}
        style={{
          paddingLeft: isSmall ? 0 : undefined,
        }}
        sx={{
          paddingBottom: isSmall ? gridSpacing : undefined,
        }}
      >
        <Box
          sx={{
            borderRadius: 1,
            boxShadow: 10,
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <img
            src={
              theme.palette.mode === 'light'
                ? require('public/img/splash/collection-editor-light.png')
                : require('public/img/splash/collection-editor-dark.png')
            }
            alt="App demo"
            style={{
              width: '100%',
              // Prevent stretching
              height: 'auto',
            }}
          />
        </Box>
      </Grid>
    </Grid>
  )
}

export default EditorFeatures
