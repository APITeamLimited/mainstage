mod intervals;
mod manager;
mod types;
use lazy_static::lazy_static;
use js_sys::Reflect;
use protobuf::Message;
use uuid::Uuid;
use std::collections::HashMap;
use std::sync::Mutex;
use wasm_bindgen::prelude::*;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub fn main() {
    println!("Hello, world!")
}

lazy_static! {
    static ref MANAGERS: Mutex<HashMap<String, manager::TestInfoManager>> =
        Mutex::new(HashMap::new());
}

#[wasm_bindgen (js_name = rawInitTestData)]
pub fn init_test_data(test_info: Option<Vec<u8>>) -> Result<JsValue, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    let test_info_id = Uuid::new_v4().to_string();

    // If test data is provided, parse it
    match test_info {
        Some(bytes) => {
            // Create input stream from bytes
            let mut input_stream = protobuf::CodedInputStream::from_bytes(&bytes);

            match types::TestInfo::parse_from(&mut input_stream) {
                Ok(test_info) => {
                    managers.insert(
                        test_info_id.to_owned(),
                        manager::TestInfoManager::new(Some(&test_info)),
                    );
                }
                Err(e) => {
                    // If there is an error parsing the test info, return an error
                    return Err(JsValue::from_str(
                        format!("Error parsing test info from protobuf: {}", e).as_str(),
                    ));
                }
            }
        }
        None => {
            // If no test info is provided, create a new test info
            managers.insert(test_info_id.to_owned(), manager::TestInfoManager::new(None));
        }
    }

    Ok(JsValue::from_str(test_info_id.as_str()))
}

#[wasm_bindgen (js_name = rawDeleteTestData)]
pub fn delete_test_data(test_info_id: &str) -> Result<(), JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    match managers.remove(test_info_id) {
        Some(_) => Ok(()),
        None => Err(JsValue::from_str(
            format!("No test data found for test_info_id: {}", test_info_id).as_str(),
        )),
    }
}

#[wasm_bindgen (js_name = rawAddStreamedData)]
pub fn add_streamed_data(test_info_id: &str, bytes: Vec<u8>) -> Result<(), JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let test_info = match managers.get_mut(test_info_id) {
        Some(test_info) => test_info,
        None => {
            return Err(JsValue::from_str(
                format!("No test data found for test_info_id: {}", test_info_id).as_str(),
            ))
        }
    };

    match test_info.add_streamed_data(bytes) {
        Ok(_) => Ok(()),
        Err(e) => Err(JsValue::from_str(e.as_str())),
    }
}

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

struct IntervalsQuery {
    location: Option<String>,
    metric: Option<String>,
    max_data_points: Option<u32>,

}


// #[wasm_bindgen (js_name = rawGetData)]
// pub fn get_intervals(test_info_id: &str, location: Option<String>) -> Result<JsValue, JsValue> {
//     let mut managers = MANAGERS.lock().unwrap();

//     // Get test data if it exists, otherwise return 
//     let manager = managers.get_mut(test_info_id)
//         .ok_or_else(|| JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str()))?;

//     let intervals = js_sys::Array::new();

//     let filter_by_location = location.is_some();

//     for i in manager.intervals.iter() {
