export function legacy_result(exercise, year) {
    switch(exercise) {
        case "pushups":
            return pushups(year);
            break;
        case "chinups":
            return chinups(year);
            break;
        case "squats":
            return squats(year);
            break;
    }
}

function pushups(year) {
    switch(year) {
        case "2022":
            return [
                { text: "ghost: 12011" },
                { text: "capitalclient: 9185" },
                { text: "levi: 3967" },
                { text: "old-man-zeeb: 2859" },
                { text: "mbclutter: 2587" },
                { text: "czthorpe: 2290" },
                { text: "antoncmorgan: 1475" },
                { text: "shoard: 805" },
                { text: "lukeschill96: 750" },
                { text: "boydzilla: 640" },
                { text: "starscream: 66" },
                { text: "tachyon: 5" },
                { text: "lthorpe422: 1" }
            ]
            break;
        case "2021":
            return [
                { text: "antoncmorgan: 4211" },
                { text: "ghost: 1699" },
                { text: "capitalclient: 646" },
                { text: "shoard331: 200" },
                { text: "lukeschill96: 110" },
                { text: "lthorpe422: 2" }
            ]
            break;
        case "2020":
            return [
                { text: "ghost: 10130" },
                { text: "capitalclient: 7105" },
                { text: "antoncmorgan: 1005" },
                { text: "shoard331: 760" },
                { text: "lukeschill96: 541" },
                { text: "lthorpe422: 50" }
            ]
        }
}