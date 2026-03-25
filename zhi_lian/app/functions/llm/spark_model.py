import _thread as thread
import base64
import datetime
import hashlib
import hmac
import json
from urllib.parse import urlparse, urlencode
from wsgiref.handlers import format_date_time
import ssl
import websocket
from dotenv import load_dotenv
import os


class WsParam:
    def __init__(self, APPID, APIKey, APISecret, Spark_url):
        self.APPID = APPID
        self.APIKey = APIKey
        self.APISecret = APISecret
        self.host = urlparse(Spark_url).netloc
        self.path = urlparse(Spark_url).path
        self.Spark_url = Spark_url

    def create_url(self):
        now = datetime.datetime.now()
        date = format_date_time(datetime.datetime.timestamp(now))

        signature_origin = f"host: {self.host}\ndate: {date}\nGET {self.path} HTTP/1.1"
        signature_sha = hmac.new(
            self.APISecret.encode('utf-8'),
            signature_origin.encode('utf-8'),
            digestmod=hashlib.sha256
        ).digest()
        signature_sha_base64 = base64.b64encode(signature_sha).decode('utf-8')

        authorization_origin = f'api_key="{self.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="{signature_sha_base64}"'
        authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode('utf-8')

        v = {"authorization": authorization, "date": date, "host": self.host}
        return self.Spark_url + '?' + urlencode(v)


class SparkModel:
    def __init__(self):
        load_dotenv()
        self.appid = os.getenv("APPID")
        self.api_key = os.getenv("API_KEY")
        self.api_secret = os.getenv("API_SECRET")
        self.spark_url = "wss://spark-api.xf-yun.com/v1/x1"
        self.domain = "x1"
        self.history = []

    def _get_text(self, role, content):
        self.history.append({"role": role, "content": content})
        self._trim_history()
        return self.history

    def _trim_history(self, max_length=8000):
        def getlength(history):
            return sum(len(msg["content"]) for msg in history)

        while getlength(self.history) > max_length:
            self.history.pop(0)

    def _gen_params(self, question):
        return {
            "header": {
                "app_id": self.appid,
                "uid": "1234"
            },
            "parameter": {
                "chat": {
                    "domain": self.domain,
                    "temperature": 1.2,
                    "max_tokens": 32768
                }
            },
            "payload": {
                "message": {
                    "text": question
                }
            }
        }

    def question(self, s_msg, h_msg):
        self._get_text("system", s_msg)
        question = self._get_text("user", h_msg)
        ws_param = WsParam(self.appid, self.api_key, self.api_secret, self.spark_url)
        ws_url = ws_param.create_url()

        self.answer = ""
        self.isFirst = False

        def on_message(ws, message):
            data = json.loads(message)
            code = data['header']['code']
            if code != 0:
                ws.close()
            else:
                choices = data["payload"]["choices"]
                text = choices['text'][0]
                status = choices["status"]

                if 'reasoning_content' in text and text['reasoning_content']:
                    print(text["reasoning_content"], end="")
                    self.isFirst = True

                if 'content' in text and text['content']:
                    if self.isFirst:
                        print("\n******** 思维链 ********\n")
                    print(text["content"], end="")
                    self.answer += text["content"]
                    self.isFirst = False

                if status == 2:
                    ws.close()

        def on_error(ws, error):
            print("Error:", error)

        def on_close(ws, *args):
            pass

        def on_open(ws):
            def run(*_):
                data = json.dumps(self._gen_params(question))
                ws.send(data)
            thread.start_new_thread(run, ())

        ws = websocket.WebSocketApp(
            ws_url,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
            on_open=on_open
        )
        ws.appid = self.appid
        ws.question = question
        ws.domain = self.domain
        websocket.enableTrace(False)
        ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})

        self._get_text("assistant", self.answer)
        return self.answer


def main():
    a = SparkModel()
    s_msg = ''
    h_msg = '你好'
    b = a.question(s_msg, h_msg)
    print(b)


if __name__ == "__main__":
    main()