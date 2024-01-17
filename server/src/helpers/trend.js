const trend = (array) => {
    let increasing = true;
    let decreasing = true;
    let fluctuating = false;
    let stable = true;

    for (let i = 1; i < array.length; i++) {
        if (array[i] > array[i - 1]) {
            decreasing = false;
            stable = false;
        } else if (array[i] < array[i - 1]) {
            increasing = false;
            stable = false;
        } else {
            increasing = false;
            decreasing = false;
        }

        // Check for fluctuating trend
        if (i > 1 && ((array[i] > array[i - 1] && array[i - 1] < array[i - 2]) ||
            (array[i] < array[i - 1] && array[i - 1] > array[i - 2]))) {
            fluctuating = true;
        }
    }

    if (increasing) {
        return {
            status: "Increasing Trend",
            analysis: "The forecasted model indicates a consistent upward trend in blood donation participation over the forecasted period, reflecting a positive growth in community engagement."
        };
    } else if (decreasing) {
        return {
            status: "Decreasing Trend",
            analysis: "The forecasted model signals a consistent decline in blood donation participation. Further analysis is crucial to identify contributing factors and implement strategies to encourage more donors."
        };
    } else if (fluctuating) {
        return {
            status: "Fluctuating Trend",
            analysis: "Fluctuations in the forecasted data indicate variability in blood donation participation. Explore contributing factors to better understand the nature of these fluctuations."
        };
    } else if (stable) {
        return {
            status: "Stable Trend",
            analysis: "The forecasted model suggests a stable trend in blood donation participation with minimal variation. Evaluate whether this stability aligns with expectations."
        };
    } else {
        return {
            status: "Mixed Trend",
            analysis: "The data exhibits a mix of trends without a clear pattern. Further investigation is necessary to understand the complex nature of blood donation participation."
        };
    }
}

export default trend;
