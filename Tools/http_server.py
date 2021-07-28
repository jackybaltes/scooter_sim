import http.server
import csv
import json
import pandas as pd
import os
PORT = 8080
csv_path = '../data/scores.csv'
#python3 http_server.py 127.0.0.1

class TestHandler(http.server.SimpleHTTPRequestHandler):

    

    def do_POST(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST')
        self.end_headers()
        if self.path.endswith('/set_csv'):
            with open(csv_path,'a') as myfile:
                length = int(self.headers['content-length']) 
                data_string = self.rfile.read(length).decode("utf-8")
                print("got :")
                print(data_string)
                res = json.loads(data_string) 
                #use replace just in cas we get a smart guy sending a break line code and destroy our csv file

                myfile.write(res['username'].replace("\n", " ")+","+res['score'].replace("\n", " ")+"\n")


    def do_GET(self):
        print("GET REQUEST")
        if self.path.endswith('/get_csv'):
            with open(csv_path,'r') as myfile:
                self.send_response(200)
                str = myfile.read()
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
                self.send_header('Access-Control-Allow-Methods', 'GET,POST')
                self.send_header("Content-type", "text/csv")
                self.send_header("Content-length", len(str))
                self.end_headers()
                self.wfile.write(bytes(str,encoding='utf-8'))
        else:
            print("error")


    def get_high_score(self):
        data = pd.read_csv(csv_path)
        scores = data.score.tolist()

        max = scores[0]
        for s in scores:
            if(s>max):
                max = s
        
        return max






def start_server():
    """Start the server."""
    server_address = ("", PORT)
    server = http.server.HTTPServer(server_address, TestHandler)
    server.serve_forever()

if __name__ == "__main__":
    start_server()