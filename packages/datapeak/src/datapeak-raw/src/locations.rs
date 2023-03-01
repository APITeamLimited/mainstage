use crate::{types, MANAGERS, manager::TestInfoManager};
use js_sys::Array;
use uuid::Uuid;
use wasm_bindgen::prelude::*;

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

#[wasm_bindgen (js_name = rawSetLocations)]
pub fn set_locations(test_info_id: &str, locations: Array) -> Result<(), JsValue> {
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

    // Extract vector of locations from JsValue
    let locations: Vec<String> = locations.iter().map(|x| x.as_string().unwrap()).collect();

    test_info.locations = locations;
    test_info.locations_state = Uuid::new_v4().to_string();

    Ok(())
}

impl TestInfoManager {
    pub fn update_locations(&mut self, interval: &types::Interval) {
        let mut new_locations: Vec<String> = Vec::new();

        for (sink_name, _) in interval.sinks.iter() {
            // Split sink name with '::'

            let parts = sink_name.split("::").collect::<Vec<&str>>();

            new_locations.push(parts[0].to_string());
        }

        let mut updated_locations = false;

        for new_location in new_locations.iter() {
            if !self.locations.contains(&new_location) {
                self.locations.push(new_location.to_string());
                updated_locations = true;
            }
        }

        if updated_locations {
            self.locations_state = Uuid::new_v4().to_string();
        }
    }
}
