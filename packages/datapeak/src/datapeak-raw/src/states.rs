use wasm_bindgen::prelude::*;

use crate::MANAGERS;

#[wasm_bindgen (js_name = rawGetLocationsState)]
pub fn get_location_state(test_info_id: &str) -> Result<String, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(manager.locations_state.to_owned())
}

#[wasm_bindgen (js_name = rawGetThresholdsState)]
pub fn get_thresholds_state(test_info_id: &str) -> Result<String, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(manager.thresholds_state.to_owned())
}



#[wasm_bindgen (js_name = rawGetMessagesState)]
pub fn get_messages_state(test_info_id: &str) -> Result<String, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    Ok(manager.messages_state.to_owned())
}
