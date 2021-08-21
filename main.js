const superagent = require("superagent");
const ics = require("ics");
const fs = require("fs");
const COURESE_ENDPOINT = "http://hub.m.hust.edu.cn/kcb/todate/JsonCourse.action";

const SUMMER_TIMETABLE = [
    {
        startTime: [8, 0],
        endTime: [8, 45],
    },
    {
        startTime: [8, 55],
        endTime: [9, 40],
    },
    {
        startTime: [10, 10],
        endTime: [10, 55],
    },
    {
        startTime: [11, 5],
        endTime: [11, 50],
    },
    {
        startTime: [14, 30],
        endTime: [15, 15],
    },
    {
        startTime: [15, 20],
        endTime: [16, 5],
    },
    {
        startTime: [16, 25],
        endTime: [17, 10],
    },
    {
        startTime: [17, 15],
        endTime: [18, 0],
    },
    {
        startTime: [19, 0],
        endTime: [19, 45],
    },
    {
        startTime: [19, 50],
        endTime: [20, 35],
    },
    {
        startTime: [20, 45],
        endTime: [21, 30],
    },
    {
        startTime: [21, 35],
        endTime: [22, 20],
    },
];

const AUTUMN_TIMETABLE = [
    {
        startTime: [8, 0],
        endTime: [8, 45],
    },
    {
        startTime: [8, 55],
        endTime: [9, 40],
    },
    {
        startTime: [10, 10],
        endTime: [10, 55],
    },
    {
        startTime: [11, 5],
        endTime: [11, 50],
    },
    {
        startTime: [14, 0],
        endTime: [14, 45],
    },
    {
        startTime: [14, 55],
        endTime: [15, 35],
    },
    {
        startTime: [15, 55],
        endTime: [16, 40],
    },
    {
        startTime: [16, 45],
        endTime: [17, 30],
    },
    {
        startTime: [18, 30],
        endTime: [19, 15],
    },
    {
        startTime: [19, 20],
        endTime: [20, 5],
    },
    {
        startTime: [20, 15],
        endTime: [21, 0],
    },
    {
        startTime: [21, 5],
        endTime: [21, 50],
    },
];
/**
 * 获取指定日期的课程表
 * @param {string} date
 * @param {number} weekIndex
 * @param {string} cookie
 */
const getDayCourse = async (date, weekIndex, cookie) => {
    let result = await superagent
        .get(COURESE_ENDPOINT)
        .set({
            Cookie: cookie,
        })
        .query({
            sj: date,
            zc: weekIndex,
        });

    return result.text;
};

/**
 * 将日期转换为指定格式
 * @param {Date} originDate
 */
const getFormatDate = (originDate) => {
    const date = originDate ? originDate : new Date();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    const currentDate = date.getFullYear() + "-" + month + "-" + strDate;
    return currentDate;
};
/**
 * 生成一个周次与日期对应的表
 * @param startDateString 开始日期
 * @param totalWeekNum 总周数，一共有多少周
 */
const generateMapBetweenWeekAndDate = (startDateString, totalWeekNum) => {
    let date = new Date(startDateString);
    let result = {};
    for (let weekCounter = 0; weekCounter < totalWeekNum; weekCounter++) {
        for (let dayCounter = 0; dayCounter < 7; dayCounter++) {
            result[getFormatDate(date)] = weekCounter + 1;
            date.setDate(date.getDate() + 1);
        }
    }
    return result;
};
/**
 * 解析课程数据
 * @param {Object[]} courseJSON json object
 * @param {String} dateString
 */
const parseCourses = (courses, dateString) => {
    courses = JSON.parse(courses);
    if (!Array.isArray(courses)) return;
    const date = new Date(dateString);
    let isSummer = date.getMonth() + 1 < 10;
    return courses
        .map((course) => {
            const { kc, jcx: CourseIndex } = course;
            const { XQ: week, XM: teacher, QSZC: startWeekIndex, JSZC: endWeekIndex, JSMC: classroom, KCMC: courseName } = kc[0];
            if (!week) return null;
            let timeTable = isSummer ? SUMMER_TIMETABLE : AUTUMN_TIMETABLE;
            const { startTime, endTime } = timeTable[parseInt(CourseIndex) - 1];
            const [sh, sm] = startTime;
            const [eh, em] = endTime;

            return {
                start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), sh, sm],
                end: [date.getFullYear(), date.getMonth() + 1, date.getDate(), eh, em],
                title: courseName,
                location: classroom,
                organizer: {
                    name: teacher,
                },
                description: `${week} 从第${startWeekIndex}周到第${endWeekIndex}周,由${teacher}老师任教`,
            };
        })
        .filter((c) => c);
};
const WEEK_MAP = generateMapBetweenWeekAndDate("2021-09-06", 19);
/**
 * 生成ICS需要的数据
 * @param {string} cookie 用户cookie
 */
const generateICSEvents = async (cookie) => {
    let events = [];
    for (let key in WEEK_MAP) {
        let result = await getDayCourse(key, WEEK_MAP[key], cookie);
        let courses = parseCourses(result, key);
        events = events.concat(courses);
    }
    const { error, value } = ics.createEvents(events);
    if (error) {
        console.log(error);
        return;
    }
    fs.writeFileSync("courses.ics", value);
};
generateICSEvents(``);
