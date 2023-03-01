use crate::{MANAGERS,types,manager::TestInfoManager};
use js_sys::Reflect;
use uuid::Uuid;
use wasm_bindgen::prelude::*;

#[wasm_bindgen (js_name = rawGetConsoleMessages)]
pub fn get_console_messages(test_info_id: &str) -> Result<JsValue, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    let arr = js_sys::Array::new();
    for cm in manager.test_info.console_messages.iter() {
        match cm.into() {
            Ok(js_value) => {
                arr.push(&js_value);
            }
            Err(e) => {
                return Err(e);
            }
        }
    }

    Ok(arr.into())
}

impl From<&types::ConsoleMessage> for Result<JsValue, JsValue> {
    fn from(cm: &types::ConsoleMessage) -> Self {
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

        // Convert to timestamp
        let first_occurred = chrono::NaiveDateTime::from_timestamp_opt(
            cm.first_occurred.seconds,
            cm.first_occurred.nanos as u32,
        )
        .ok_or_else(|| {
            JsValue::from_str(
                format!(
                    "Failed to convert first_occurred to timestamp: {}",
                    cm.first_occurred.seconds
                )
                .as_str(),
            )
        })?;
        Reflect::set(
            &obj,
            &JsValue::from_str("firstOccurred"),
            &JsValue::from_str(&first_occurred.to_string()),
        )?;

        let last_occurred = chrono::NaiveDateTime::from_timestamp_opt(
            cm.last_occurred.seconds,
            cm.last_occurred.nanos as u32,
        )
        .ok_or_else(|| {
            JsValue::from_str(
                format!(
                    "Failed to convert last_occurred to timestamp: {}",
                    cm.last_occurred.seconds
                )
                .as_str(),
            )
        })?;
        Reflect::set(
            &obj,
            &JsValue::from_str("lastOccurred"),
            &JsValue::from_str(&last_occurred.to_string()),
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

        Ok(obj.into())
    }
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

impl TestInfoManager {
    pub fn process_console_message(&mut self, new_message: &types::ConsoleMessage) {
        // Check if console message is already in the list

        // If not, add it

        match self
            .test_info
            .console_messages
            .iter_mut()
            .find(|x| x.message == new_message.message && x.level == new_message.level)
        {
            Some(existing_message) => {
                existing_message.last_occurred = new_message.last_occurred.clone();

                for (location, new_times_occured) in new_message.count.iter() {
                    match existing_message
                        .count
                        .iter_mut()
                        .find(|(l, _)| l.to_string() == location.to_string())
                    {
                        Some((_, existing_times_occured)) => {
                            *existing_times_occured += *new_times_occured;
                        }
                        None => {
                            existing_message
                                .count
                                .insert(location.to_string(), *new_times_occured);
                        }
                    }
                }
            }
            None => {
                self.test_info.console_messages.push(new_message.clone());
            }
        }

        self.console_messages_state = Uuid::new_v4().to_string();
    }
}
