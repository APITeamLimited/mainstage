use crate::{types, MANAGERS};
use js_sys::Reflect;
use wasm_bindgen::prelude::*;

#[wasm_bindgen (js_name = rawGetThresholds)]
pub fn get_thresholds(test_info_id: &str) -> Result<JsValue, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    let thresholds = js_sys::Array::new();

    for tr in manager.test_info.thresholds.iter() {
        let obj = js_sys::Object::new();

        Reflect::set(
            &obj,
            &JsValue::from_str("source"),
            &JsValue::from_str(tr.source.as_str()),
        )?;

        match &tr.abort_on_fail {
            Some(abort_on_fail) => {
                Reflect::set(
                    &obj,
                    &JsValue::from_str("abortOnFail"),
                    &JsValue::from_bool(*abort_on_fail),
                )?;
            }
            None => {}
        }

        match &tr.delay_abort_eval {
            Some(delay_abort_eval) => {
                Reflect::set(
                    &obj,
                    &JsValue::from_str("delayAbortEval"),
                    &JsValue::from_str(delay_abort_eval),
                )?;
            }
            None => {}
        }

        thresholds.push(&obj);
    }

    Ok(JsValue::from(thresholds))
}

#[wasm_bindgen (js_name = rawGetConsoleMessages)]
pub fn get_console_messages(test_info_id: &str) -> Result<JsValue, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    let console_messages = js_sys::Array::new();

    for cm in manager.test_info.console_messages.iter() {
        let obj = js_sys::Object::new();

        Reflect::set(
            &obj,
            &JsValue::from_str("message"),
            &JsValue::from_str(cm.message.as_str()),
        )?;
        Reflect::set(
            &obj,
            &JsValue::from_str("level"),
            &JsValue::from_str(cm.level.as_str()),
        )?;
        Reflect::set(
            &obj,
            &JsValue::from_str("firstOccured"),
            &JsValue::from_str(&cm.first_occurred.get_or_default().to_string()),
        )?;
        Reflect::set(
            &obj,
            &JsValue::from_str("lastOccured"),
            &JsValue::from_str(&cm.last_occurred.get_or_default().to_string()),
        )?;

        let count = js_sys::Object::new();
        for (key, value) in cm.count.iter() {
            Reflect::set(
                &count,
                &JsValue::from_str(key.as_str()),
                &JsValue::from_f64(*value as f64),
            )?;
        }

        Reflect::set(&obj, &JsValue::from_str("count"), &count)?;

        console_messages.push(&obj);
    }

    Ok(JsValue::from(console_messages))
}

#[wasm_bindgen (js_name = rawGetLocations)]
pub fn get_locations(test_info_id: &str) -> Result<JsValue, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    let locations = js_sys::Array::new();

    for location in manager.locations.iter() {
        locations.push(&JsValue::from_str(location.as_str()));
    }

    Ok(JsValue::from(locations))
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
