import { useEffect, useState } from 'react'

import {
  Graph,
  GlobeTestMessage,
  MetricsCombination,
  GraphSeries,
  BUILT_IN_METRICS,
  AVAILABLE_LOAD_ZONES,
} from '@apiteam/types/src'
import ClearIcon from '@mui/icons-material/Clear'
import {
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
  Divider,
  TextField,
  Stack,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useFormik } from 'formik'
import { ColorPicker } from 'mui-color'
import * as Yup from 'yup'

import { CustomDialog } from 'src/components/custom-mui'

import { BaseGraph } from './BaseGraph'

export const defaultSeries = {
  color: '#808080',
  kind: 'area',
  loadZone: 'global',
  metric: 'vus',
} as const as GraphSeries

export type EditGraphDialogProps = {
  onClose: () => void
  existingGraph: {
    graph: Graph | null
    open: boolean
    isNew?: boolean
  } | null
  setGraph: (graph: Graph) => void
  metrics:
    | (GlobeTestMessage & {
        orchestratorId: string
      } & MetricsCombination)[]
    | null
}

export const EditGraphDialog = ({
  onClose,
  existingGraph,
  setGraph,
  metrics,
}: EditGraphDialogProps) => {
  const formik = useFormik({
    initialValues: {
      name: existingGraph?.graph?.name ?? 'New',
      description: existingGraph?.graph?.description ?? '',
      series: existingGraph?.graph?.series ?? [defaultSeries],
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Graph name is required')
        .max(20, "Graph name can't be more than 20 characters"),
      description: Yup.string().max(
        100,
        "Graph description can't be more than 100 characters"
      ),
      series: Yup.array().of(
        Yup.object({
          loadZone: Yup.string()
            .required()
            .oneOf(
              AVAILABLE_LOAD_ZONES as unknown as string[],
              'Invalid load zone'
            ),
          kind: Yup.string()
            .required('Required')
            .oneOf(['line', 'area', 'column']),
          metric: Yup.string()
            .required('Required')
            .oneOf(
              BUILT_IN_METRICS as unknown as string[],
              "Metric doesn't exist"
            ),
          color: Yup.string().required('Required'),
        })
      ),
    }),

    onSubmit: (values) => {
      setGraph({
        __typename: 'Graph',
        id: existingGraph?.graph?.id ?? '',
        name: values.name,
        description: values.description,
        series: values.series,
        desiredWidth: existingGraph?.graph?.desiredWidth ?? 1,
      })
      onClose()
    },
  })

  // When the graph changes, update the form
  useEffect(() => {
    if (existingGraph?.graph) {
      formik.resetForm({
        values: {
          name: existingGraph.graph.name,
          description: existingGraph.graph.description ?? '',
          series: existingGraph.graph.series,
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingGraph?.graph])

  const [displayedGraph, setDisplayedGraph] = useState<Graph | null>(null)

  useEffect(() => {
    setDisplayedGraph({
      __typename: 'Graph',
      id: existingGraph?.graph?.id ?? '',
      name: formik.values.name,
      description: formik.values.description,
      series: formik.values.series,
      desiredWidth: existingGraph?.graph?.desiredWidth ?? 1,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.series])

  return displayedGraph && metrics ? (
    <form noValidate onSubmit={formik.handleSubmit}>
      <CustomDialog
        open={!!existingGraph}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        title={formik.values.name}
        dialogActions={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                formik.setFieldValue('series', [
                  ...formik.values.series,
                  defaultSeries,
                ])
              }}
            >
              Add Series
            </Button>
            <Button onClick={onClose} variant="contained" color="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              onClick={formik.submitForm}
            >
              Save
            </Button>
          </>
        }
      >
        <Stack
          spacing={2}
          sx={{
            padding: 2,
            overflow: 'hidden',
            height: 'calc(100% - 1.5rem)',
          }}
        >
          <Box
            sx={{
              height: 250,
              marginTop: -2,
            }}
          >
            <BaseGraph graph={displayedGraph} metrics={metrics} />
          </Box>
          <Stack
            spacing={2}
            direction="row"
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <TextField
              label="Name"
              name="name"
              value={formik.values.name}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              variant="outlined"
              size="small"
            />
            <TextField
              label="Description (optional)"
              name="description"
              value={formik.values.description}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={Boolean(
                formik.touched.description && formik.errors.description
              )}
              helperText={
                formik.touched.description && formik.errors.description
              }
              variant="outlined"
              size="small"
              sx={{
                width: '100%',
              }}
            />
          </Stack>
          <FormHelperText>Series</FormHelperText>
          <div style={{ height: '100%' }}>
            {formik.values.series.map((series, index) => (
              <Box key={`${series.metric}-${series.loadZone}-${index}`}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                  paddingTop={index === 0 ? 1 : 3}
                  paddingBottom={
                    index === formik.values.series.length - 1 ? 1 : 3
                  }
                >
                  <Stack
                    spacing={2}
                    sx={{
                      width: '100%',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        width: '100%',
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{
                          width: '100%',
                        }}
                      >
                        <InputLabel id="metric-label">Metric</InputLabel>
                        <Select
                          labelId="series-metric-label"
                          id="series-metric"
                          name={`series.${index}.metric`}
                          value={series.metric}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                          }}
                        >
                          {BUILT_IN_METRICS.map((metric, index) => (
                            <MenuItem value={metric} key={index}>
                              {metric}
                            </MenuItem>
                          ))}
                        </Select>
                      </Stack>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{
                          width: '100%',
                        }}
                      >
                        <InputLabel id="loadZone-label">Load Zone</InputLabel>
                        <Select
                          labelId="series-loadZone-label"
                          id="series-loadZone"
                          name={`series.${index}.loadZone`}
                          value={series.loadZone}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                          }}
                        >
                          {AVAILABLE_LOAD_ZONES.map((loadZone, index) => (
                            <MenuItem value={loadZone} key={index}>
                              {loadZone}
                            </MenuItem>
                          ))}
                        </Select>
                      </Stack>
                    </Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        width: '100%',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <InputLabel id="series-color-label">Color</InputLabel>
                        <ColorPicker
                          value={series.color}
                          onChange={(color) => {
                            console.log(color)
                            formik.setFieldValue(
                              `series.${index}.color`,
                              `#${(color as { hex: string }).hex}`
                            )
                          }}
                          hideTextfield
                          disableAlpha
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <InputLabel id="series-kind-label">Kind</InputLabel>
                        <Select
                          labelId="series-kind-label"
                          id="series-kind"
                          name={`series.${index}.kind`}
                          value={series.kind}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          variant="outlined"
                          size="small"
                        >
                          <MenuItem value="line">Line</MenuItem>
                          <MenuItem value="area">Area</MenuItem>
                          <MenuItem value="column">Column</MenuItem>
                        </Select>
                      </Stack>
                    </Stack>
                    {formik.touched.series?.[index] &&
                      formik.errors.series?.[index] && (
                        <FormHelperText error>
                          {Object.values(formik.errors.series?.[index])}
                        </FormHelperText>
                      )}
                  </Stack>
                  <div>
                    <Tooltip title="Remove series">
                      <IconButton
                        onClick={() => {
                          formik.setFieldValue(
                            'series',
                            formik.values.series.filter((_, i) => i !== index)
                          )
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </Stack>
                {index !== formik.values.series.length - 1 && <Divider />}
              </Box>
            ))}
          </div>
        </Stack>
      </CustomDialog>
    </form>
  ) : (
    <></>
  )
}
