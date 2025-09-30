import holidayJp from "@holiday-jp/holiday_jp";
import timetableData from '../data/timetable.json'

type DateType = "weekday" | "holiday";

type Schedule = {
  weekday: { [key: number]: number[] };
  holiday: { [key: number]: number[] };
};

type BusTimes = {
  previous: string;
  next: string;
  after: string;
};

function getDateType(date: Date): DateType {
  return holidayJp.isHoliday(date) || date.getDay() === 0 || date.getDay() === 6
    ? "holiday"
    : "weekday";
}

function formatTime(hour: number, minute: number) {
    if (hour === undefined || minute === undefined) {
    return "--:--";
    }
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m}`;
}

function busTimes(
  nextTenMinutesHour: number,
  nextTenMinutesMinute: number,
  dateType: DateType
): BusTimes {
  const schedule: Schedule = timetableData as Schedule;
  let nextBusIndex =
    schedule[dateType]?.[nextTenMinutesHour]?.findIndex(
      (m) => m >= nextTenMinutesMinute
    ) ?? -1;
  let nextBusHour = nextTenMinutesHour;
  console.log({ nextBusIndex, nextBusHour });
  if (nextBusIndex === undefined || nextBusIndex === -1) {
    nextBusIndex = 0;
    nextBusHour += 1;
  }

  const previousBusHour = nextBusIndex === 0 ? nextBusHour - 1 : nextBusHour;
  const previousBusIndex =
    nextBusIndex === 0
      ? schedule[dateType]?.[nextBusHour - 1]
        ? schedule[dateType][nextBusHour - 1].length - 1
        : -1
      : nextBusIndex - 1;

  const afterBusHour =
    nextBusIndex === (schedule[dateType]?.[nextBusHour]?.length ?? 0) - 1
      ? nextBusHour + 1
      : nextBusHour;
  const afterBusIndex =
    nextBusIndex === (schedule[dateType]?.[nextBusHour]?.length ?? 0) - 1
      ? 0
      : nextBusIndex + 1;
  return {
    previous: formatTime(
      previousBusHour,
      schedule[dateType]?.[previousBusHour]?.[previousBusIndex]
    ),
    next: formatTime(
      nextBusHour,
      schedule[dateType]?.[nextBusHour]?.[nextBusIndex]
    ),
    after: formatTime(
      afterBusHour,
      schedule[dateType]?.[afterBusHour]?.[afterBusIndex]
    ),
  };
}

export default function Home() {
  const date = new Date();
  const dateType: DateType = getDateType(date);
  const nextTenFuture = new Date(date.getTime() + 10 * 60000);
  const busTimesResult = busTimes(nextTenFuture.getHours(), nextTenFuture.getMinutes(), dateType);

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm rounded-2xl shadow-lg bg-white p-6">
          <h1 className="text-xl font-semibold mb-4 text-center">
            Bus timetable
          </h1>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">Previous bus</div>
              <div className="text-lg font-medium">
                {busTimesResult.previous}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-sm text-blue-700">Next bus</div>
              <div className="text-2xl font-bold text-blue-800">
                {busTimesResult.next}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">Following bus</div>
              <div className="text-lg font-medium">{busTimesResult.after}</div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            Updated: {date.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
