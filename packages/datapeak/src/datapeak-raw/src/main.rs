mod intervals;
mod manager;
mod types;
mod states;
mod accessors;
mod console_messages;
mod locations;

use lazy_static::lazy_static;
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

#[wasm_bindgen (js_name = rawAddMessage)]
pub fn add_message(test_info_id: &str, message: &str) -> Result<(), JsValue> {
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

    test_info.test_info.messages.push(message.to_string());
    test_info.messages_state = Uuid::new_v4().to_string();

    Ok(())
}

#[wasm_bindgen (js_name = rawTestInfoIdExists)]
pub fn test_info_id_exists(test_info_id: &str) -> bool {
    let managers = MANAGERS.lock().unwrap();

    managers.contains_key(test_info_id)
}
