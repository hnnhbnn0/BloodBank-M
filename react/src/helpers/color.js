const palette = {
    primary: {
        hex: "#0d6efd",
        rgb: [13, 110, 253],
    },
    secondary: {
        hex: "#6c757d",
        rgb: [108, 117, 125],
    },
    success: {
        hex: "#198754",
        rgb: [25, 135, 84],
    },
    info: {
        hex: "#0dcaf0",
        rgb: [13, 202, 240],
    },
    warning: {
        hex: "#ffc107",
        rgb: [255, 193, 7],
    },
    danger: {
        hex: "#dc3545",
        rgb: [220, 53, 69],
    },
    light: {
        hex: "#f8f9fa",
        rgb: [248, 249, 250],
    },
    dark: {
        hex: "#212529",
        rgb: [33, 37, 41],
    },
};

const color = (color, type, options = {}) => {
    switch (type) {
        case "hex":
            return palette[color.toLowerCase()].hex;
        case "rgb":
            return `rgb(${palette[color.toLowerCase()].rgb.join(", ")})`;
        case "rgba":
            return `rgba(${[...palette[color.toLowerCase()].rgb, (typeof options.opacity === "number" ? options.opacity : 1)].join(", ")})`;
        case "gradient":
            return [
                options.type, "-", "gradient", "(", (options.type === "linear" ? ((typeof options.degrees === "number" ? options.degrees : 180) + "deg") : "circle"), ",", " ",
                "rgba", "(", [...palette[color[0].toLowerCase()].rgb, (typeof options.opacity === "number") ? options.opacity : 1].join(", "), ")", " ", "25%", ",", " ",
                "rgba", "(", [...palette[color[1].toLowerCase()].rgb, (typeof options.opacity === "number") ? options.opacity : 1].join(", "), ")", " ", "75%",
                ")"
            ].join("");
        default:
            return palette[color.toLowerCase()].hex;
    }
}

export default color;