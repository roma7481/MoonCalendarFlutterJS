import 'package:flutter/material.dart';
import 'package:webview_flutter_plus/webview_flutter_plus.dart';

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
                var latitude = 50.7086074;
                var longitude = 30.216038;
                var timezone = "\'Asia/Novosibirsk\'";

                String script =
                    "lunarDays($day, $latitude, $longitude, $timezone)";
                var res = _controller.webViewController
                    .evaluateJavascript(script)
                    .then((value) => {
                      print(value)
                    });
                debugPrint("Res: ==== " + res.toString());

                _controller.getHeight().then((double height) {
                  print("Height: " + height.toString());
                  setState(() {
                    _height = height;
                  });
                });
              },
              javascriptMode: JavascriptMode.unrestricted,
            ),
          )
        ],
      ),
    );
  }
}
