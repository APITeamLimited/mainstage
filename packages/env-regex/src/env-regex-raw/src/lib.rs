mod utils;

#[macro_use]
extern crate lazy_static;
use regex::Regex;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

lazy_static! {
    static ref BRACED_REGEX: Regex = Regex::new(r"\{\{(([^}][^}]?|[^}]}?)*)\}\}").unwrap();
}

#[wasm_bindgen(js_name = rawContainsEnvVariables)]
pub fn contains_env_variables(path: &str) -> bool {
    BRACED_REGEX.is_match(path)
}

#[derive(Serialize, Deserialize)]
struct Match {
    text: String,
    start: usize,
    end: usize,
}

#[wasm_bindgen(typescript_custom_section)]
const MatchResult: &'static str = r#"
export type MatchResult = {
    text: string;
    start: number;
    end: number;
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "MatchResult")]
    pub type MatchResult;
}

#[wasm_bindgen(js_name = rawMatchAllEnvVariables)]
pub fn match_all_env_variables(path: &str) -> JsValue {
    let matches: Vec<Match> = BRACED_REGEX
        .find_iter(path)
        .map(|m| Match {
            text: m.as_str().to_string(),
            start: m.start(),
            end: m.end(),
        })
        .collect();

    serde_wasm_bindgen::to_value(&matches).unwrap()
}