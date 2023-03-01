use crate::MANAGERS;
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
            &JsValue::from_str("metric"),
            &JsValue::from_str(tr.metric.as_str()),
        )?;

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

#[wasm_bindgen (js_name = rawGetMessages)]
pub fn get_messages(test_info_id: &str) -> Result<JsValue, JsValue> {
    let mut managers = MANAGERS.lock().unwrap();

    // Get test data if it exists, otherwise return
    let manager = managers.get_mut(test_info_id).ok_or_else(|| {
        JsValue::from_str(format!("No test data found for test_info_id: {}", test_info_id).as_str())
    })?;

    let messages = js_sys::Array::new();

    for message in manager.test_info.messages.iter() {
        messages.push(&JsValue::from_str(message.as_str()));
    }

    Ok(JsValue::from(messages))
}