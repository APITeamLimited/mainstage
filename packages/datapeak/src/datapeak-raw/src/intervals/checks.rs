use serde::Serialize;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

use crate::{manager::TestInfoManager, types, MANAGERS};

#[derive(Serialize)]
pub struct CheckCollection {
    pub scenarios: Vec<Check>,
    pub groups: Vec<Check>,
    pub named: Vec<Check>,
}

impl CheckCollection {
    pub fn new() -> CheckCollection {
        CheckCollection {
            scenarios: Vec::new(),
            groups: Vec::new(),
            named: Vec::new(),
        }
    }
}

impl From<&CheckCollection> for JsValue {
    fn from(cs: &CheckCollection) -> Self {
        serde_wasm_bindgen::to_value(cs).unwrap()
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Check {
    pub name: String,
    pub rates: HashMap<String, CheckRate>,
    pub threshold: Option<types::Threshold>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckRate {
    pub sink_path: String,
    pub pass: i64,
    pub fail: i64,
    pub total: i64,
    pub rate: f64,
}

impl TestInfoManager {
    // Calculates and filters sinks for checks and stores then in the TestInfoManager
    // for convenient access
    pub fn update_checks(
        self: &mut TestInfoManager,
        interval: &types::Interval,
    ) -> Result<(), String> {
        for (sink_name, sink) in interval.sinks.iter() {
            // Split sink name at ::
            let sink_name_parts: Vec<&str> = sink_name.split("::").collect();

            // Only process if is a check and is a rate
            if sink_name_parts.len() != 4
                || sink_name_parts[1] != "checks"
                || (sink_name_parts[2] != "check"
                    && sink_name_parts[2] != "group"
                    && sink_name_parts[2] != "scenario")
                || match sink.type_.enum_value() {
                    Ok(types::SinkType::Rate) => false,
                    _ => true,
                }
            {
                continue;
            }

            let location = sink_name_parts[0].to_string();
            let check_type = sink_name_parts[2].to_string();
            let check_name = sink_name_parts[3].to_string();

            let mut check_vec = match check_type.as_str() {
                "check" => &mut self.checks.named,
                "group" => &mut self.checks.groups,
                "scenario" => &mut self.checks.scenarios,
                _ => return Err(format!("Invalid check type: {}", check_type)),
            };

            // See if check already exists in checks
            let check = match check_vec.iter_mut().find(|x| x.name == sink_name_parts[0]) {
                Some(check) => check,
                None => {
                    // Create new check
                    let new_check = Check {
                        name: check_name,
                        rates: HashMap::new(),
                        threshold: None,
                    };

                    check_vec.push(new_check);
                    check_vec.last_mut().unwrap()
                }
            };

            // Insert at location
            check.rates.insert(
                location,
                CheckRate {
                    sink_path: sink_name.to_string(),
                    pass: parse_label(&sink.labels, "pass")?,
                    fail: parse_label(&sink.labels, "fail")?,
                    total: parse_label(&sink.labels, "total")?,
                    rate: sink
                        .labels
                        .get("rate")
                        .ok_or(format!(
                            "Failed to parse rate value for sink: {}",
                            sink_name
                        ))?
                        .to_owned(),
                },
            );

            // Check for threshold changes
            check.threshold = try_find_threshold(&self.test_info.thresholds, sink_name);
        }
        Ok(())
    }

}

fn try_find_threshold(thresholds: &Vec<types::Threshold>, sink_name: &str) -> Option<types::Threshold> {
    // TODO: Implement

    None

    // let mut threshold = None;

    // for threshold in self.test_info.thresholds.iter() {
    //     if threshold.name == sink_name {
    //         threshold = Some(threshold.clone());
    //         break;
    //     }
    // }

    // threshold
}

fn parse_label(labels: &HashMap<String, f64>, key: &str) -> Result<i64, String> {
    match labels.get(key) {
        Some(pass) => Ok(pass.round() as i64),
        None => Err(format!("Failed to parse pass value for sink: {}", key)),
    }
}

#[wasm_bindgen (js_name = rawGetChecks)]
pub fn get_checks(test_info_id: &str) -> Result<JsValue, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(JsValue::from(&manager.checks))
}

#[wasm_bindgen (js_name = rawGetChecksState)]
pub fn get_checks_state(test_info_id: &str) -> Result<String, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(manager.checks_state.clone())
}
