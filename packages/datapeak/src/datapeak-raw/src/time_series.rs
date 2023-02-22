use std::iter::FromIterator;

use js_sys::{Array, Reflect};
use serde::{Serialize, Deserialize};
use wasm_bindgen::{JsValue, prelude::wasm_bindgen};

use crate::{types, MANAGERS};

#[wasm_bindgen (js_name = rawIntervalTimeSeries)]
pub fn interval_time_series(
    test_info_id: &str,
    sink_path: &str,
    downsizing_method: JsValue,
) -> Result<JsValue, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    let downsizing_method: DownsizingMethod = serde_wasm_bindgen::from_value(downsizing_method)
        .map_err(|e| JsValue::from_str(e.to_string().as_str()))?;

    // Split sink_path at ::
    let sink_path: Vec<&str> = sink_path.split("::").collect();

    if sink_path.len() < 2 {
        return Err(JsValue::from_str(
            "sink path must be of the form <sink>::<label>",
        ));
    }

    let label = sink_path[sink_path.len() - 1];
    let binding = sink_path[..sink_path.len() - 1].join("::");
    let sink_path = binding.as_str();

    let time_series = get_time_series(
        &manager.test_info.intervals,
        sink_path,
        label,
        downsizing_method,
    )?;

    let series_object = js_sys::Object::new();

    Reflect::set(
        &series_object,
        &JsValue::from_str("name"),
        &JsValue::from_str(&sink_path),
    )?;

    Reflect::set(
        &series_object,
        &JsValue::from_str("data"),

        &Array::from_iter(time_series.iter().map(|(x_, y)| Array::of2(&JsValue::from_f64(*x_), &JsValue::from_f64(*y)))),
    )?;

    Ok(JsValue::from(series_object))
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum DownsizingMethod {
    FixedIntervals {
        max_data_points: Option<usize>,
    },
    MovingMean {
        window_size: Option<usize>,
        max_data_points: Option<usize>,
    },
    // Add more downsizing methods here...
    None,
}

pub fn get_time_series(
    intervals: &Vec<types::Interval>,
    sink_path: &str,
    label: &str,
    downsizing_method: DownsizingMethod,
) -> Result<Vec<(f64, f64)>, String> {
    inspect_path_for_labels(intervals, sink_path, label)?;

    let intervals: Vec<(f64, f64)> = intervals
        .iter()
        .map(|interval| interval_to_time_series(interval, sink_path, label))
        .collect();

    match downsizing_method {
        DownsizingMethod::FixedIntervals { max_data_points } => {
            Ok(fixed_intervals(&intervals, max_data_points))
        }
        DownsizingMethod::MovingMean {
            window_size,
            max_data_points,
        } => Ok(moving_mean_points(&intervals, window_size, max_data_points)),
        DownsizingMethod::None => Ok(intervals),
    }
}

pub fn inspect_path_for_labels(
    intervals: &Vec<types::Interval>,
    sink_path: &str,
    label: &str,
) -> Result<(), String> {
    const SEARCH_PATH_LIMIT: usize = 10;

    // Check first 10 intervals for sink
    let mut found_sink = false;

    for interval in intervals.iter().take(10) {
        if interval.sinks.contains_key(sink_path) {
            found_sink = true;
            break;
        }
    }

    if !found_sink {
        return Err(format!(
            "Sink path {} not found in first {} intervals",
            sink_path, SEARCH_PATH_LIMIT
        ));
    }

    // Check first 10 intervals for label
    let mut found_label = false;

    for interval in intervals.iter().take(10) {
        if let Some(sink) = interval.sinks.get(sink_path) {
            if sink.labels.contains_key(label) {
                found_label = true;
                break;
            }
        }
    }

    if !found_label {
        return Err(format!(
            "Label {} not found in first {} intervals",
            label, SEARCH_PATH_LIMIT
        ));
    }

    Ok(())
}

fn interval_to_time_series(interval: &types::Interval, sink_path: &str, label: &str) -> (f64, f64) {
    let sink = match interval.sinks.get(sink_path) {
        Some(sink) => sink,
        None => return (0.0, 0.0),
    };

    let value = match sink.labels.get(label) {
        Some(value) => value,
        None => return (0.0, 0.0),
    };

    (interval.period as f64, *value)
}

fn fixed_intervals(data: &[(f64, f64)], max_data_points: Option<usize>) -> Vec<(f64, f64)> {
    let total = data.len();
    let max = max_data_points.unwrap_or(1000);

    if total <= max {
        return data.to_vec();
    }

    let step = (total - 1) as f64 / (max - 1) as f64;
    let mut result = Vec::with_capacity(max);

    for i in 0..max {
        let j = (i as f64 * step).round() as usize;
        if j >= total {
            // if j is out of bounds, select the last element of data
            result.push(data[total - 1]);
        } else {
            result.push(data[j]);
        }
    }

    result
}

fn moving_mean_points(
    data: &[(f64, f64)],
    window_size: Option<usize>,
    max_data_points: Option<usize>,
) -> Vec<(f64, f64)> {
    let total = data.len();
    let mut result = Vec::new();

    let max_data_points = max_data_points.unwrap_or(1000);

    // Dynamically adjust mean window size based on the number of data points
    let window_size = window_size.unwrap_or(if total < max_data_points {
        1
    } else {
        total / max_data_points
    });

    if total < window_size || max_data_points == 0 {
        return result;
    }

    let mut window_sum = data.iter().take(window_size).map(|p| p.1).sum::<f64>();
    let mut window_start = 0;
    let mut window_end = window_size;

    while window_end <= total {
        let window_mean = window_sum / (window_size as f64);
        result.push((data[window_start + window_size / 2].0, window_mean));
        if result.len() >= max_data_points {
            break;
        }
        window_sum -= data[window_start].1;
        window_sum += data[window_end].1;
        window_start += 1;
        window_end += 1;
    }

    result
}
