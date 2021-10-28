import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:webview_flutter_plus/webview_flutter_plus.dart';

import 'LunarDay.dart';

void main() {
  //runApp(MyApp());
  runApp(WebViewPlusExample());
}

class WebViewPlusExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: WebViewPlusExampleMainPage(),
    );
  }
}

class WebViewPlusExampleMainPage extends StatefulWidget {
  @override
  _WebViewPlusExampleMainPageState createState() =>
      _WebViewPlusExampleMainPageState();
}

class _WebViewPlusExampleMainPageState
    extends State<WebViewPlusExampleMainPage> {
  WebViewPlusController _controller;
  double _height = 1000;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('webview_flutter_plus Example'),
      ),
      body: ListView(
        children: [
          SizedBox(
            height: _height,
            child: WebViewPlus(
              javascriptChannels: null,
              initialUrl: 'assets/index.html',
              onWebViewCreated: (controller) {
                this._controller = controller;
              },
              onPageFinished: (url) {
                var day = "\'30-07-2021\'";
                var year = "\'2019\'";
                var month = "\'2\'";
                var latitude = 50.7086074;
                var longitude = 30.216038;
                var timezone = "\'Asia/Novosibirsk\'";

                String singleLunarDayScript =
                    "lunarDayConverter(lunarDays($day, $latitude, $longitude, $timezone))";

                _controller.webViewController
                    .evaluateJavascript(singleLunarDayScript)
                    .then((value) {
                      print(value);
                      List<LunarDay> lunarDays = processResult(value);

                      for (LunarDay lunarDay in lunarDays) {
                        debugPrint("Num: " + lunarDay.number.toString());
                        debugPrint("Start: " + lunarDay.getStart());
                        debugPrint("End: " + lunarDay.getEnd());
                    }
                });

                String allLunarDaysInYearScript =
                    "allLunarDayInMonthConverter(allLunarDaysInMonth($month, $year, $latitude, $longitude, $timezone))";

                _controller.webViewController
                    .evaluateJavascript(allLunarDaysInYearScript)
                    .then((value) {
                      print(value);
                      List<LunarDay> lunarDays = processResult(value);

                      for (LunarDay lunarDay in lunarDays) {
                        debugPrint("Num: " + lunarDay.number.toString());
                        debugPrint("Start: " + lunarDay.getStart());
                        debugPrint("End: " + lunarDay.getEnd());
                      }
                });

              },
              javascriptMode: JavascriptMode.unrestricted,
            ),
          )
        ],
      ),
    );
  }

  List<LunarDay> processResult(String jsonString) {
    List<LunarDay> resultList = [];

    List<Map<String, dynamic>> jsonArray =
        (jsonDecode(jsonString) as List<dynamic>).cast<Map<String, dynamic>>();

    for (var i = 0; i < jsonArray.length; i++) {
      Map<String, dynamic> jsonElement = jsonArray[i];
      LunarDay lunarDay = LunarDay.fromJson(jsonElement);
      resultList.add(lunarDay);
    }
    return resultList;
  }
}
