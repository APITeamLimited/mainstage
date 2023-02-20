use protobuf::Message;
use crate::types;

pub struct TestInfoManager {
    pub test_info: types::TestInfo,
    pub locations: Vec<String>,
}

impl TestInfoManager {
    pub fn new(test_info: Option<&types::TestInfo>) -> TestInfoManager {
        let mut new_manager = TestInfoManager {
            test_info: match test_info {
                Some(test_info) => test_info.clone(),
                None => types::TestInfo::new(),
            },
            locations: Vec::new(),
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
        for data_point in streamed_data.data_points.iter() {
            // Get message type
            match &data_point.data {
                Some(types::data_point::Data::Interval(interval)) => {
                    self.process_interval(&interval);
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

        Ok(())
    }

    fn process_interval(&mut self, interval: &types::Interval) {
        // Check if period is already in the list
        self.test_info
            .intervals
            .retain(|x| x.period != interval.period);

        // Find where to insert the new interval so that the list is sorted
        let mut index = 0;
        for (i, existing_interval) in self.test_info.intervals.iter().enumerate() {
            if existing_interval.period > interval.period {
                index = i;
                break;
            }
        }

        // Insert the new interval
        self.test_info.intervals.insert(index, interval.clone());

        // Add new locations to the list
        self.update_locations(interval)
    }

    
    fn process_console_message(&mut self, new_message: &types::ConsoleMessage) {
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
    }

    fn process_threshold(&mut self, threshold: &types::Threshold) {
        // Check if threshold already exists with source
        self.test_info.thresholds.retain(|x| {
            x.source != threshold.source
        });

        // Append the new threshold
        self.test_info.thresholds.push(threshold.clone());
    }

    fn update_locations(&mut self, interval: &types::Interval) {
        let mut locations: Vec<String> = Vec::new();

        for (sink_name, _) in interval.sinks.iter() {
            // Split sink name with '::'

            let parts = sink_name.split("::").collect::<Vec<&str>>();

            locations.push(parts[0].to_string());
        }

        for new_location in locations.iter() {
            if !self.locations.contains(&new_location) {
                self.locations.push(new_location.to_string());
            }
        }
    }

    
}
