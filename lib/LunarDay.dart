import 'package:intl/intl.dart';

class LunarDay {
  int number;
  double start;
  double end;

  LunarDay(int number, double start, double end) {
    this.number = number;
    this.start = start;
    this.end = end;
  }

  int getNumber() {
    return number;
  }

  void setNumber(int number) {
    this.number = number;
  }

  String getFormattedDate(double timestamp){
    var dateTime = DateTime.fromMillisecondsSinceEpoch(timestamp.toInt());
    return DateFormat('dd/MM/yyyy, h:mm:ss a').format(dateTime);
  }

  String getStart() {
    return getFormattedDate(start);
  }

  void setStart(double start) {
    this.start = start;
  }

  String getEnd() {
    return getFormattedDate(end);
  }

  void setEnd(double end) {
    this.end = end;
  }

  LunarDay.fromJson(Map<String, dynamic> json)
      : start = json['start'],
        end = json['end'],
        number = json['number'];

  Map<String, dynamic> toJson() => {
        'start': start,
        'end': end,
        'number': number,
      };
}
