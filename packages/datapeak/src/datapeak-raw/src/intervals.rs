use crate::types;
use regex::Regex;
use lazy_static::lazy_static;

pub struct IntervalWithFraction {
    interval: types::Interval,
    fraction: f64,
}

const MEAN_KEYS: &[&str; 2] = &["avg", "med"];

const INTERVAL_PERIOD_SECONDS: f64 = 1.0;

lazy_static! {
    static ref PERCENTILE_REGEX: Regex = Regex::new(r"p\([1-9][0-9]?|100\)").unwrap();
}

// Estimates summary intervals for each of the metrics in the given intervals,
// by averaging the values of the metrics over the given intervals.
pub fn estimate_summary_interval(intervals: &[types::Interval]) -> Result<types::Interval, String> {
    if intervals.len() == 0 {
        return Err("No intervals to estimate, at least one interval is required".to_string());
    }

    let mut estimated_interval = types::Interval::new();

    for interval in intervals {
        for (sink_name, sink) in interval.sinks.iter() {
            let estimated_sink = estimated_interval
                .sinks
                .entry(sink_name.to_string())
                .or_insert(types::Sink::new());

            for (key, value) in sink.labels.iter() {
                let mut estimated_value = estimated_sink
                    .labels
                    .entry(key.to_string())
                    .or_insert(0.0)
                    .to_owned();

                if key == "count" {
                    estimated_value += value;
                } else if key == "rate" {
                    // Skip rate, here as its calculated at the end usng the count
                } else if MEAN_KEYS.contains(&key.as_str()) || PERCENTILE_REGEX.is_match(key) {
                    estimated_value += value / intervals.len() as f64;
                } else if key == "max" {
                    estimated_value = estimated_value.max(*value);
                } else if key == "min" {
                    estimated_value = estimated_value.min(*value);
                } else {
                    return Err(format!("Unknown key: {}", key));
                }

                estimated_sink
                    .labels
                    .insert(key.to_string(), estimated_value);
            }
        }
    }

    // Calculate rate
    for (sink_name, sink) in estimated_interval.sinks.iter_mut() {
        let mut total_count = 0.0;
        let mut found_count = false;

        for (key, value) in sink.labels.iter() {
            if key == "count" {
                total_count = *value;
                found_count = true;
            }
        }

        if found_count {
            let mut estimated_rate = sink
                .labels
                .entry("rate".to_string())
                .or_insert(0.0)
                .to_owned();

            estimated_rate = total_count / intervals.len() as f64 / INTERVAL_PERIOD_SECONDS;

            sink.labels.insert("rate".to_string(), estimated_rate);
        }
    }

    Ok(estimated_interval)
}
