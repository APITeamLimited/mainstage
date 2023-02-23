use std::cmp::Ordering;

use crate::{manager::TestInfoManager, types};
use uuid::Uuid;

impl TestInfoManager {
    pub fn process_interval(&mut self, interval: &types::Interval) {
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

        // Estimate summary intervaval
        self.update_summary_interval();

        // Add new locations to the list
        self.update_locations(interval);
    }

    // Estimates summary intervals for each of the metrics in the given intervals,
    // by averaging the values of the metrics over the given intervals.
    pub fn update_summary_interval(self: &mut TestInfoManager) {
        if self.test_info.intervals.is_empty() {
            self.summary = None;
            return;
        }

        // Sort the intervals by period
        self.test_info
            .intervals
            .sort_by(|a, b| match a.period.partial_cmp(&b.period) {
                Some(ordering) => ordering,
                None => Ordering::Equal,
            });

        // Set summary interval to the last interval
        if let Some(last_interval) = self.test_info.intervals.last() {
            self.summary = Some(last_interval.clone());
        } else {
            self.summary = None;
        }

        self.summary_state = Uuid::new_v4().to_string();
    }
}
