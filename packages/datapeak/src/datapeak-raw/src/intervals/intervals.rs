use js_sys::Reflect;
use wasm_bindgen::prelude::*;

use crate::{manager::TestInfoManager, types, MANAGERS};

const INTERVAL_PERIOD_SECONDS: u32 = 6;

impl TestInfoManager {
    pub fn process_interval(&mut self, interval: &types::Interval) -> Result<(), String> {
        // Check if period is already in the list
        self.test_info
            .intervals
            .retain(|x| x.period != interval.period);

        // Add extra fields to the interval
        let mut new_interval = types::Interval::new();
        new_interval.period = interval.period;

        // Mean is the count divided by the period
        for (sink_name, sink) in interval.sinks.iter() {
            match self.calculate_sink_fields(sink_name, sink, interval.period) {
                Ok(sink) => {
                    new_interval.sinks.insert(sink_name.to_string(), sink);
                }
                Err(err) => {
                    return Err(format!("Error calculating sink fields: {}", err));
                }
            }
        }

        // Find where to insert the new interval so that the list is sorted
        let index = self
            .test_info
            .intervals
            .iter()
            .position(|x| x.period > new_interval.period)
            .unwrap_or(self.test_info.intervals.len());

        // Insert the new interval
        self.test_info.intervals.insert(index, new_interval);

        if self.latest_period >= interval.period {
            return Ok(());
        }

        self.latest_period = interval.period;

        // Estimate summary intervaval
        self.update_summary_interval();

        // Add new locations to the list
        self.update_locations(&interval);

        // Update the checks
        self.update_checks(&interval);

        Ok(())
    }

    
    fn calculate_sink_fields(
        &self,
        sink_name: &str,
        sink: &types::Sink,
        period: i32,
    ) -> Result<types::Sink, String> {
        let sink_type = match sink.type_.enum_value() {
            Ok(sink_type) => sink_type,
            Err(_) => return Err("Unknown sink type".to_string()),
        };

        match sink_type {
            types::SinkType::Counter => self.calculate_counter_sink_fields(sink_name, sink, period),
            types::SinkType::Rate => self.calculate_rate_sink_fields(sink),
            _ => Ok(sink.clone()),
        }
    }

    fn calculate_counter_sink_fields(
        self: &TestInfoManager,
        sink_name: &str,
        sink: &types::Sink,
        period: i32,
    ) -> Result<types::Sink, String> {
        let count = match sink.labels.get("count") {
            Some(count) => count.clone(),
            None => return Err("Counter value not found".to_string()),
        };

        let mut calculated_sink = sink.clone();

        calculated_sink
            .labels
            .insert("mean".to_string(), count / ( INTERVAL_PERIOD_SECONDS as f64 * (period + 1) as f64));

        // If sink period is 0, then rate is the count, else it is the count
        // of this interval minus the count of the previous interval
        // divided by the period

        let rate = if period == 0 {
            count / INTERVAL_PERIOD_SECONDS as f64
        } else {
            let previous_interval = self
                .test_info
                .intervals
                .iter()
                .find(|x| x.period == (period - 1));

            if let Some(previous_interval) = previous_interval {
                let previous_count = previous_interval
                    .sinks
                    .get(sink_name)
                    .and_then(|sink| sink.labels.get("count"))
                    .unwrap_or(&0.0);

                (count - previous_count) / INTERVAL_PERIOD_SECONDS as f64
            } else {
                // Assume no previous interval means that the previous interval was 0
                count
            }
        };

        calculated_sink.labels.insert("rate".to_string(), rate);

        Ok(calculated_sink)
    }

    fn calculate_rate_sink_fields(
        self: &TestInfoManager,
        sink: &types::Sink,
    ) -> Result<types::Sink, String> {
        let pass = match sink.labels.get("pass") {
            Some(pass) => pass.clone(),
            None => return Err("Rate pass value not found".to_string()),
        };

        let total = match sink.labels.get("total") {
            Some(total) => total.clone(),
            None => return Err("Rate total value not found".to_string()),
        };

        let mut calculated_sink = sink.clone();

        calculated_sink
            .labels
            .insert("fail".to_string(), total - pass);

        Ok(calculated_sink)
    }
}

#[wasm_bindgen (js_name = rawGetIntervalsState)]
pub fn get_intervals_state(test_info_id: &str) -> Result<String, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(manager.intervals_state.to_owned())
}

impl From<types::Interval> for Result<JsValue, JsValue> {
    fn from(interval: types::Interval) -> Self {
        let obj = js_sys::Object::new();

        Reflect::set(
            &obj,
            &JsValue::from_str("period"),
            &JsValue::from_f64(interval.period as f64),
        )?;

        let sinks = js_sys::Object::new();
        for (sink_key, sink_value) in interval.sinks.iter() {
            let sink = js_sys::Object::new();

            let labels = js_sys::Object::new();
            for (label, label_value) in sink_value.labels.iter() {
                Reflect::set(
                    &labels,
                    &JsValue::from_str(label.as_str()),
                    &JsValue::from_f64(*label_value),
                )?;
            }
            Reflect::set(&sink, &JsValue::from_str("labels"), &labels)?;

            Reflect::set(&sinks, &JsValue::from_str(sink_key.as_str()), &sink)?;
        }
        Reflect::set(&obj, &JsValue::from_str("sinks"), &sinks)?;

        Ok(JsValue::from(obj))
    }
}
