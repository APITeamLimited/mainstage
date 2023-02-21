use wasm_bindgen::prelude::*;

use crate::MANAGERS;

#[wasm_bindgen (js_name = rawGetLocationState)]
pub fn get_location_state(test_info_id: &str) -> Result<String, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(manager.location_state.to_owned())
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

#[wasm_bindgen (js_name = rawGetConsoleMessagesState)]
pub fn get_console_messages_state(test_info_id: &str) -> Result<String, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(manager.console_messages_state.to_owned())
}

#[wasm_bindgen (js_name = rawGetThresholdsState)]
pub fn get_threasholds_state(test_info_id: &str) -> Result<String, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(manager.thresholds_state.to_owned())
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
