use protobuf::Message;
use uuid::Uuid;
use crate::{types, intervals::checks::CheckCollection};

pub struct TestInfoManager {
    pub test_info: types::TestInfo,

    pub latest_period: i32,

    pub intervals_state: String,
    pub console_messages_state: String,
    pub thresholds_state: String,

    pub locations: Vec<String>,
    pub locations_state: String,

    pub summary: Option<types::Interval>,
    pub summary_state: String,

    pub checks: CheckCollection,
    pub checks_state: String,

    pub messages_state: String,
}

impl TestInfoManager {
    pub fn new(test_info: Option<&types::TestInfo>) -> TestInfoManager {
        let mut new_manager = TestInfoManager {
            test_info: match test_info {
                Some(test_info) => test_info.clone(),
                None => types::TestInfo::new(),
            },

            // Set most recent interval to -1 so that the first interval (0) will be processed
            latest_period: -1,

            locations: Vec::new(),
            locations_state: Uuid::new_v4().to_string(),

            intervals_state: Uuid::new_v4().to_string(),
            console_messages_state: Uuid::new_v4().to_string(),
            thresholds_state: Uuid::new_v4().to_string(),
            
            summary: None,
            summary_state: Uuid::new_v4().to_string(),

            checks: CheckCollection::new(),
            checks_state: Uuid::new_v4().to_string(),

            messages_state: Uuid::new_v4().to_string(),
        };

        for interval in new_manager.test_info.intervals.clone().iter() {
            new_manager.update_locations(&interval);
        }

        new_manager
    }

    pub fn add_streamed_data(&mut self, bytes: Vec<u8>) -> Result<(), String> {
        // Create input stream from bytes
        let mut input_stream = protobuf::CodedInputStream::from_bytes(&bytes);

        match types::StreamedData::parse_from(&mut input_stream) {
            Ok(streamed_data) => {
                self.process_streamed_data(&streamed_data)?;
                Ok(())
            }
            Err(e) => Err(format!("Error parsing streamed data from protobuf: {}", e)),
        }
    }

    fn process_streamed_data(&mut self, streamed_data: &types::StreamedData) -> Result<(), String> {
        // Intervals need to be processed in order

        let mut intervals: Vec<types::Interval> = Vec::new();

        for data_point in streamed_data.data_points.iter() {
            // Get message type
            match &data_point.data {
                Some(types::data_point::Data::Interval(interval)) => {
                    intervals.push(interval.clone());
                }
                Some(types::data_point::Data::ConsoleMessage(console_message)) => {
                    self.process_console_message(&console_message);
                }
                Some(types::data_point::Data::Threshold(threashold)) => {
                    self.process_threshold(&threashold);
                }
                None => {
                    return Err(format!("No data found in data point"));
                }
            }
        }

        // Sort intervals by period and ensure no duplicates
        intervals.sort_by(|a, b| a.period.cmp(&b.period));
        intervals.dedup_by(|a, b| a.period == b.period);

        // Add intervals to test info
        for interval in intervals.iter() {
            self.process_interval(interval)?;
        }

        Ok(())
    }

 
    fn process_threshold(&mut self, threshold: &types::Threshold) {
        // Check if threshold already exists with source
        self.test_info.thresholds.retain(|x| {
            x.source != threshold.source && x.metric != threshold.metric
        });

        // Append the new threshold
        self.test_info.thresholds.push(threshold.clone());

        self.thresholds_state = Uuid::new_v4().to_string();
    }

}
