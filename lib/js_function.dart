import 'package:flutter/services.dart';
import 'package:flutter_js/flutter_js.dart';
import 'package:intl/intl.dart';

Future<int> calcLunarDays(JavascriptRuntime flutterJs, DateTime date, double latitude, double longitude) async {
  var formattedDate = DateFormat('dd-MM-yyyy').format(date);
  int first = 10;
  int second = 20;
  String blocJS = await rootBundle.loadString("assets/bundle.js");
  final jsResult = flutterJs.evaluate(blocJS + """lunarDays($formattedDate, $latitude, $longitude)""");
  // final jsResult3 = flutterJs.evaluate(blocJS + "Math.trunc(Math.random() * 100).toString();");
  // final jsResult = jsRuntime.evaluate(blocJS + """add($first, $second)""");

  // JsEvalResult jsResult = flutterJs.evaluate(
  //     "Math.trunc(Math.random() * 100).toString();");

  // JsEvalResult jsResult = flutterJs.evaluate(
  //     "Math.trunc(Math.random() * 100).toString();");


   //final jsResult = jsRuntime.evaluate(blocJS + "lunarDays(03-07-2021, 30, 50)");
  //final jsResult2 = flutterJs.evaluate("lunarDays(03-07-2021, 30, 50);");
  //final jsResult4 = flutterJs.evaluate(blocJS + "lunarDays(03-07-2021, 30, 50);");


  final jsStringResult = jsResult.stringResult;
  return int.parse(jsStringResult);
}