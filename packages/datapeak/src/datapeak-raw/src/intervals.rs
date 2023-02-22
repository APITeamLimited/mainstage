use crate::{manager::TestInfoManager, types};
use lazy_static::lazy_static;
use regex::Regex;
use uuid::Uuid;

const MEAN_KEYS: &[&str; 2] = &["avg", "med"];

const INTERVAL_PERIOD_SECONDS: f64 = 1.0;

lazy_static! {
    static ref PERCENTILE_REGEX: Regex = Regex::new(r"p\([1-9][0-9]?|100\)").unwrap();
}

impl TestInfoManager {
    pub fn process_interval(&mut self, interval: &types::Interval) {
        // Check if period is already in the list
        self.test_info
            .intervals
            .retain(|x| x.period != interval.period);

        // Find where to insert the new interval so that the list is sorted
        let mut index = 0;
        for (i, existing_interval) in self.test_info.intervals.iter().enumerate() {
            if existing_interval.period > interval.period {
                index = i;
                break;
            }
        }

        // Insert the new interval
        self.test_info.intervals.insert(index, interval.clone());

        // Estimate summary intervaval
        self.update_summary_interval();

        // Add new locations to the list
        self.update_locations(interval);
    }

    // Estimates summary intervals for each of the metrics in the given intervals,
    // by averaging the values of the metrics over the given intervals.
    pub fn update_summary_interval(self: &mut TestInfoManager) {
        let mut estimated_interval = types::Interval::new();

        let intervals_len = self.test_info.intervals.len() as f64;

        for interval in self.test_info.intervals.iter() {
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
                        estimated_value += value;
                    } else if key == "max" {
                        estimated_value = estimated_value.max(*value);
                    } else if key == "min" {
                        estimated_value = estimated_value.min(*value);
                    }

                    // All other keys are ignored

                    estimated_sink
                        .labels
                        .insert(key.to_string(), estimated_value);
                }
            }
        }

        let mut output_interval = estimated_interval.clone();

        // Calculate rate
        for (metric_key, sink) in estimated_interval.sinks.iter() {
            for (label, value) in sink.labels.iter() {
                if label == "count" {
                    let estimated_rate = *value / intervals_len / INTERVAL_PERIOD_SECONDS;

                    output_interval
                        .sinks
                        .get_mut(metric_key)
                        .unwrap()
                        .labels
                        .insert("rate".to_string(), estimated_rate);
                } else if MEAN_KEYS.contains(&label.as_str()) || PERCENTILE_REGEX.is_match(label) {
                    let estimated_value = *value / intervals_len;

                    output_interval
                        .sinks
                        .get_mut(metric_key)
                        .unwrap()
                        .labels
                        .insert(label.to_string(), estimated_value);
                }
            }
        }

        self.summary = Some(output_interval);
        self.summary_state = Uuid::new_v4().to_string();
    }
}
