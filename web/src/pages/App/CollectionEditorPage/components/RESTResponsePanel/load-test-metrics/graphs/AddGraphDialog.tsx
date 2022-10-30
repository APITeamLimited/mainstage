import { useEffect, useMemo, useState } from 'react'

import {
  Graph,
  GlobeTestMessage,
  MetricsCombination,
  GraphSeries,
  BUILT_IN_METRICS,
} from '@apiteam/types/src'
import ClearIcon from '@mui/icons-material/Clear'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
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
  useTheme,
} from '@mui/material'
import { useFormik } from 'formik'
import { ColorPicker } from 'mui-color'
import * as Yup from 'yup'

import { useHashSumModule, useSimplebarReactModule } from 'src/contexts/imports'

import { BaseGraph } from './BaseGraph'

export const defaultSeries = {
  color: '#808080',
  kind: 'area',
  name: 'vus',
  metric: 'vus',
} as const as GraphSeries

export type AddGraphDialogProps = {
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

export const AddGraphDialog = ({
  onClose,
  existingGraph,
  setGraph,
  metrics,
}: AddGraphDialogProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()
  const { default: hash } = useHashSumModule()

  const theme = useTheme()

  const [editState, setEditState] = useState<Graph | null>(
    existingGraph?.graph ?? null
  )

  const [oldSeriesMetrics, setOldSeriesMetrics] = useState<string[]>([])

  const formik = useFormik({
    initialValues: {
      name: editState?.name ?? 'New',
      description: editState?.description ?? '',
      series: editState?.series ?? [defaultSeries],
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
          name: Yup.string()
            .required('Series name is required')
            .max(20, "Series name can't be more than 20 characters"),
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
        id: editState?.id ?? '',
        name: values.name,
        description: values.description,
        series: values.series,
        desiredWidth: editState?.desiredWidth ?? 1,
      })
      handleClose()
    },
  })

  useEffect(() => {
    if (existingGraph?.graph) {
      setEditState(existingGraph.graph)

      formik.setValues({
        name: existingGraph.graph.name,
        description: existingGraph.graph.description ?? '',
        series: existingGraph.graph.series,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingGraph])

  const handleClose = () => {
    onClose()
  }

  useEffect(() => {
    if (hash(formik.values.series) !== hash(oldSeriesMetrics)) {
      formik.values.series.forEach((series, index) => {
        if (series.metric !== oldSeriesMetrics[index]) {
          setFormikSeriesName(index, series.metric)
        }
      })

      setOldSeriesMetrics(formik.values.series.map((s) => s.metric))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.series])

  const setFormikSeriesName = (index: number, name: string) => {
    const series = [...formik.values.series]
    series[index].name = name
    formik.setFieldValue('series', series)
  }

  const unifiedState = useMemo(
    () => ({
      ...editState,
      series: formik.values.series,
    }),
    [formik.values.series, editState]
  )

  return editState && metrics ? (
    <Dialog
      open={!!existingGraph}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            fontWeight: 'bold',
          }}
        >
          {formik.values.name}
        </DialogTitle>
        <Stack
          spacing={3}
          sx={{
            padding: 3,
          }}
        >
          <BaseGraph graph={unifiedState} metrics={metrics} />
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
          <Box>
            <SimpleBar style={{ maxHeight: '210px' }}>
              <div style={{ height: '100%' }}>
                {formik.values.series.map((series, index) => (
                  <Box key={`${series.name}-${index}`}>
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
                          <TextField
                            label="Name"
                            name={`series.${index}.name`}
                            value={series.name}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            variant="outlined"
                            size="small"
                          />
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
                        </Stack>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          sx={{
                            width: '100%',
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <InputLabel id="series-color-label">
                              Color
                            </InputLabel>
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
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
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
                                formik.values.series.filter(
                                  (_, i) => i !== index
                                )
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
            </SimpleBar>
          </Box>
        </Stack>
        <DialogActions>
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
          <Button onClick={handleClose} variant="contained" color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  ) : (
    <></>
  )
}
