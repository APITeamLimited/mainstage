use crate::{MANAGERS,manager::TestInfoManager};
use uuid::Uuid;
use wasm_bindgen::prelude::*;

#[wasm_bindgen (js_name = rawGetSummary)]
pub fn get_summary(test_info_id: &str) -> Result<JsValue, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    match &manager.summary {
        Some(summary) => Result::from(summary.clone()),
        None => Ok(JsValue::null()),
    }
}

#[wasm_bindgen (js_name = rawGetSummaryState)]
pub fn get_summary_state(test_info_id: &str) -> Result<String, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(manager.summary_state.to_owned())
}

impl TestInfoManager {
    // Estimates summary intervals for each of the metrics in the given intervals,
    // by averaging the values of the metrics over the given intervals.
    pub fn update_summary_interval(self: &mut TestInfoManager) {
        if self.test_info.intervals.is_empty() {
            self.summary = None;
            return;
        }

        self.summary = match self.test_info.intervals.len() {
            0 => None,
            len => Some(self.test_info.intervals[len - 1].clone()),
        };

        self.summary_state = Uuid::new_v4().to_string();
    }
}